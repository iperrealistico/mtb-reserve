import { Resend } from "resend";
import { db } from "@/lib/db";
import { CONTACT_INBOX_EMAIL, MAILBOX_FROM_EMAIL, sendEmail, stripHtml, textToHtml } from "@/lib/email";
import { logEvent } from "@/lib/events";

const resend = new Resend(process.env.RESEND_API_KEY || "re_mock_key");

function getHeader(headers: Record<string, string> | null | undefined, name: string) {
    if (!headers) {
        return null;
    }

    const target = name.toLowerCase();
    for (const [key, value] of Object.entries(headers)) {
        if (key.toLowerCase() === target) {
            return value;
        }
    }

    return null;
}

function parseMailboxAddress(value: string) {
    const match = value.match(/^(?:"?([^"]*)"?\s)?<?([^<>\s]+@[^<>\s]+)>?$/);
    if (!match) {
        return {
            name: null,
            email: value.trim().toLowerCase(),
        };
    }

    return {
        name: match[1]?.trim() || null,
        email: match[2].trim().toLowerCase(),
    };
}

function normalizeThreadSubject(subject: string) {
    const cleaned = subject.replace(/^(re|fwd?):\s*/gi, "").trim();
    return cleaned.toLowerCase() || "(no subject)";
}

function ensureReplySubject(subject: string) {
    return /^re:/i.test(subject) ? subject : `Re: ${subject}`;
}

function parseReferenceIds(value: string | null | undefined) {
    if (!value) {
        return [];
    }

    const matches = value.match(/<[^>]+>/g);
    if (matches && matches.length > 0) {
        return matches;
    }

    return value
        .split(/\s+/)
        .map((part) => part.trim())
        .filter(Boolean);
}

async function findThreadForInbound({
    mailbox,
    participantEmail,
    subject,
    inReplyTo,
    references,
}: {
    mailbox: string;
    participantEmail: string;
    subject: string;
    inReplyTo?: string | null;
    references?: string | null;
}) {
    const referencedIds = Array.from(new Set([inReplyTo, ...parseReferenceIds(references)].filter(Boolean) as string[]));

    if (referencedIds.length > 0) {
        const referencedMessage = await db.inboxMessage.findFirst({
            where: {
                messageId: { in: referencedIds },
            },
            select: { threadId: true },
            orderBy: { createdAt: "desc" },
        });

        if (referencedMessage) {
            return db.inboxThread.findUnique({ where: { id: referencedMessage.threadId } });
        }
    }

    return db.inboxThread.findFirst({
        where: {
            mailbox,
            participantEmail,
            normalizedSubject: normalizeThreadSubject(subject),
        },
        orderBy: { latestMessageAt: "desc" },
    });
}

export async function ingestMailboxEmail(eventData: {
    email_id: string;
    from: string;
    to: string[];
    subject?: string | null;
    message_id?: string | null;
}) {
    const mailbox = CONTACT_INBOX_EMAIL.toLowerCase();
    const recipients = (eventData.to || []).map((recipient) => recipient.toLowerCase());
    if (!recipients.includes(mailbox)) {
        await logEvent({
            level: "INFO",
            actorType: "SYSTEM",
            eventType: "MAILBOX_IGNORED",
            message: "Ignored inbound email for unsupported mailbox recipient",
            metadata: {
                mailbox,
                to: recipients,
                emailId: eventData.email_id,
            },
        });
        return { ignored: true };
    }

    const existing = await db.inboxMessage.findFirst({
        where: { resendEmailId: eventData.email_id },
        select: { id: true },
    });
    if (existing) {
        return { duplicate: true };
    }

    const { data, error } = await resend.emails.receiving.get(eventData.email_id);
    if (error || !data) {
        throw error || new Error("Unable to retrieve inbound email content");
    }

    const subject = data.subject || eventData.subject || "(no subject)";
    const { email: participantEmail, name: participantName } = parseMailboxAddress(data.from || eventData.from);
    const inReplyTo = getHeader(data.headers as Record<string, string> | undefined, "in-reply-to");
    const referencesHeader = getHeader(data.headers as Record<string, string> | undefined, "references");

    const existingThread = await findThreadForInbound({
        mailbox,
        participantEmail,
        subject,
        inReplyTo,
        references: referencesHeader,
    });

    const receivedAt = data.created_at ? new Date(data.created_at) : new Date();
    const textBody = data.text || (data.html ? stripHtml(data.html) : "");

    const result = await db.$transaction(async (tx) => {
        const thread = existingThread
            ? await tx.inboxThread.update({
                where: { id: existingThread.id },
                data: {
                    participantName: participantName || existingThread.participantName,
                    subject,
                    normalizedSubject: normalizeThreadSubject(subject),
                    unreadCount: { increment: 1 },
                    latestMessageAt: receivedAt,
                    lastInboundAt: receivedAt,
                },
            })
            : await tx.inboxThread.create({
                data: {
                    mailbox,
                    participantEmail,
                    participantName,
                    subject,
                    normalizedSubject: normalizeThreadSubject(subject),
                    unreadCount: 1,
                    latestMessageAt: receivedAt,
                    lastInboundAt: receivedAt,
                },
            });

        const message = await tx.inboxMessage.create({
            data: {
                threadId: thread.id,
                direction: "INBOUND",
                resendEmailId: data.id,
                messageId: data.message_id || eventData.message_id || null,
                inReplyTo,
                referencesHeader,
                fromAddress: data.from || eventData.from,
                toAddresses: data.to,
                ccAddresses: data.cc || [],
                subject,
                textBody,
                htmlBody: data.html || null,
                receivedAt,
            },
        });

        if (data.attachments && data.attachments.length > 0) {
            await tx.inboxAttachment.createMany({
                data: data.attachments.map((attachment) => ({
                    messageId: message.id,
                    resendAttachmentId: attachment.id,
                    filename: attachment.filename,
                    contentType: attachment.content_type,
                    contentDisposition: attachment.content_disposition || null,
                    contentId: attachment.content_id || null,
                })),
                skipDuplicates: true,
            });
        }

        return { thread, message };
    });

    await logEvent({
        level: "INFO",
        actorType: "SYSTEM",
        eventType: "MAILBOX_RECEIVED",
        message: "Inbound mailbox email stored",
        entityType: "InboxThread",
        entityId: result.thread.id,
        metadata: {
            emailId: data.id,
            from: data.from,
            subject,
        },
    });

    return result;
}

export async function sendMailboxReply(threadId: string, body: string) {
    const thread = await db.inboxThread.findUnique({
        where: { id: threadId },
        include: {
            messages: {
                orderBy: { createdAt: "asc" },
            },
        },
    });

    if (!thread) {
        throw new Error("Thread not found");
    }

    const replyTarget = [...thread.messages]
        .reverse()
        .find((message) => message.direction === "INBOUND" && message.messageId)?.messageId
        || thread.messages.find((message) => message.messageId)?.messageId
        || null;

    const references = Array.from(new Set(thread.messages.map((message) => message.messageId).filter(Boolean) as string[]));
    const subject = ensureReplySubject(thread.subject);
    const sentAt = new Date();

    const result = await sendEmail({
        from: MAILBOX_FROM_EMAIL,
        to: thread.participantEmail,
        subject,
        text: body,
        html: textToHtml(body),
        category: "mailbox_reply",
        entityId: thread.id,
        headers: {
            ...(replyTarget ? { "In-Reply-To": replyTarget } : {}),
            ...(references.length > 0 ? { References: references.join(" ") } : {}),
        },
        tags: [
            { name: "category", value: "mailbox_reply" },
            { name: "mailbox", value: "contact" },
        ],
    });

    if (result.error) {
        throw result.error;
    }

    const message = await db.inboxMessage.create({
        data: {
            threadId: thread.id,
            direction: "OUTBOUND",
            resendEmailId: result.data?.id || null,
            messageId: null,
            inReplyTo: replyTarget,
            referencesHeader: references.length > 0 ? references.join(" ") : null,
            fromAddress: MAILBOX_FROM_EMAIL,
            toAddresses: [thread.participantEmail],
            ccAddresses: [],
            subject,
            textBody: body,
            htmlBody: textToHtml(body),
            sentAt,
        },
    });

    await db.inboxThread.update({
        where: { id: thread.id },
        data: {
            unreadCount: 0,
            latestMessageAt: sentAt,
            lastOutboundAt: sentAt,
            status: "OPEN",
        },
    });

    return message;
}

export async function getInboxAttachmentDownloadUrl(attachmentId: string) {
    const attachment = await db.inboxAttachment.findUnique({
        where: { resendAttachmentId: attachmentId },
        include: {
            message: {
                select: {
                    resendEmailId: true,
                },
            },
        },
    });

    if (!attachment || !attachment.message.resendEmailId) {
        throw new Error("Attachment not found");
    }

    const { data, error } = await resend.emails.receiving.attachments.get({
        emailId: attachment.message.resendEmailId,
        id: attachment.resendAttachmentId,
    });

    if (error || !data?.download_url) {
        throw error || new Error("Unable to retrieve attachment download URL");
    }

    return data.download_url;
}
