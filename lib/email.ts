import { db } from "@/lib/db";
import { Resend } from "resend";
import { logEvent } from "@/lib/events";
import { getSiteSettings } from "@/lib/site-settings";
import { getBaseUrl } from "@/lib/runtime";
import { getTenantRouteSlug } from "@/lib/tenants";

const resend = new Resend(process.env.RESEND_API_KEY || "re_mock_key");

export const DEFAULT_CONTACT_EMAIL = "contact@mtbreserve.com";
export const DEFAULT_FROM_EMAIL = "MTB Reserve <direct@mtbreserve.com>";
const SHOULD_LOG = process.env.EMAIL_DISABLED === "1" || !process.env.RESEND_API_KEY;

type EmailTag = {
    name: string;
    value: string;
};

type BookingEmailData = {
    id: string;
    tenantSlug?: string | null;
    bookingCode?: string | null;
    startTime: Date;
    quantity: number;
    customerName: string;
    customerPhone?: string | null;
    customerEmail: string;
    tenant?: {
        name?: string | null;
        contactEmail?: string | null;
        slug?: string | null;
        publicSlug?: string | null;
    } | null;
    bikeType?: {
        name?: string | null;
    } | null;
};

export type SendEmailOptions = {
    from?: string;
    to: string | string[];
    cc?: string | string[];
    replyTo?: string | string[];
    subject: string;
    html?: string;
    text?: string;
    category?: string;
    entityId?: string;
    headers?: Record<string, string>;
    tags?: EmailTag[];
};

export function escapeHtml(value: string) {
    return value
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#39;");
}

export function textToHtml(text: string) {
    return `<pre style="font-family:inherit; white-space:pre-wrap; margin:0;">${escapeHtml(text)}</pre>`;
}

export function stripHtml(html: string) {
    return html
        .replace(/<style[\s\S]*?<\/style>/gi, " ")
        .replace(/<script[\s\S]*?<\/script>/gi, " ")
        .replace(/<br\s*\/?>/gi, "\n")
        .replace(/<\/p>/gi, "\n\n")
        .replace(/<[^>]+>/g, " ")
        .replace(/&nbsp;/g, " ")
        .replace(/&amp;/g, "&")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/\n{3,}/g, "\n\n")
        .replace(/[ \t]{2,}/g, " ")
        .trim();
}

function normalizeRecipients(value: string | string[]) {
    return Array.isArray(value) ? value : [value];
}

function parseFromHeader(defaultFrom: string) {
    const match = defaultFrom.match(/^(.*)<([^>]+)>$/);
    if (!match) {
        return {
            senderName: "MTB Reserve",
            senderEmail: defaultFrom,
        };
    }

    return {
        senderName: match[1]?.trim().replace(/^"|"$/g, "") || "MTB Reserve",
        senderEmail: match[2]?.trim() || defaultFrom,
    };
}

async function getTemplateContent(
    id: string,
    placeholders: Record<string, string>,
    defaults: { subject: string; html: string; from?: string }
) {
    let { subject, html } = defaults;
    let from = defaults.from || DEFAULT_FROM_EMAIL;

    try {
        const template = await db.emailTemplate.findUnique({ where: { id } });
        if (template) {
            subject = template.subject;
            html = template.html;

            if (template.senderName || template.senderEmail) {
                const parsed = parseFromHeader(from);
                from = `${template.senderName || parsed.senderName} <${template.senderEmail || parsed.senderEmail}>`;
            }
        }
    } catch (error) {
        console.error(`Failed to fetch template ${id}`, error);
    }

    const replace = (text: string) => {
        let result = text;
        for (const [key, value] of Object.entries(placeholders)) {
            result = result.replaceAll(`{{${key}}}`, value || "");
        }
        return result;
    };

    return {
        subject: replace(subject),
        html: replace(html),
        from,
    };
}

export async function sendEmail({
    from = DEFAULT_FROM_EMAIL,
    to,
    cc,
    replyTo,
    subject,
    html,
    text,
    category = "generic",
    entityId,
    headers,
    tags = [],
}: SendEmailOptions) {
    const recipients = normalizeRecipients(to);
    const resolvedText = text || (html ? stripHtml(html) : subject);
    const payload: Parameters<typeof resend.emails.send>[0] = {
        from,
        to: recipients,
        cc: cc ? normalizeRecipients(cc) : undefined,
        replyTo: replyTo ? normalizeRecipients(replyTo) : undefined,
        subject,
        ...(html ? { html } : {}),
        text: resolvedText,
        headers: entityId ? { ...headers, "X-Entity-Ref-ID": entityId } : headers,
        tags: tags.length > 0 ? tags : [{ name: "category", value: category }],
    };

    if (SHOULD_LOG) {
        console.log(`[MOCK EMAIL] To: ${recipients.join(", ")} | From: ${from} | Subject: ${subject}`);
        await logEvent({
            level: "INFO",
            actorType: "SYSTEM",
            eventType: "EMAIL_SENT_MOCK",
            message: `Mock email: ${subject}`,
            metadata: { to: recipients, subject, type: category, providerId: "mock-id" },
        });
        return { success: true, data: { id: "mock-id" } };
    }

    try {
        const { data, error } = await resend.emails.send(payload);
        if (error) {
            throw error;
        }

        await logEvent({
            level: "INFO",
            actorType: "SYSTEM",
            eventType: "EMAIL_SENT",
            message: "Email sent",
            metadata: { to: recipients, subject, providerId: data?.id, type: category },
        });

        return { success: true, data };
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : String(error);
        await logEvent({
            level: "ERROR",
            actorType: "SYSTEM",
            eventType: "EMAIL_FAILED",
            message: "Failed to send email",
            metadata: { to: recipients, subject, type: category, error: message },
        });
        return { error };
    }
}

export async function sendConfirmationLink(to: string, routeSlug: string, token: string) {
    const link = `${getBaseUrl()}/${routeSlug}/booking/confirm/${token}`;
    const { subject, html, from } = await getTemplateContent(
        "confirmation",
        { link, tenantName: routeSlug },
        {
            subject: "Confirm your MTB Booking",
            html: `<p>Please click here to confirm your booking: <a href="${link}">${link}</a></p><p>This link expires in 30 minutes.</p>`,
        }
    );

    return sendEmail({
        from,
        to,
        subject,
        html,
        text: stripHtml(html),
        category: "confirmation",
        entityId: token,
        tags: [
            { name: "category", value: "confirmation" },
            { name: "tenant", value: routeSlug },
        ],
    });
}

export async function sendBookingRecap(to: string, booking: BookingEmailData) {
    const routeSlug = booking.tenant?.slug
        ? getTenantRouteSlug({
            slug: booking.tenant.slug,
            publicSlug: booking.tenant.publicSlug ?? null,
        })
        : booking.tenantSlug;
    const pickupUrl = `${getBaseUrl()}/${routeSlug}`;

    const { subject, html, from } = await getTemplateContent(
        "recap",
        {
            bookingCode: booking.bookingCode || "N/A",
            date: new Date(booking.startTime).toLocaleDateString(),
            time: new Date(booking.startTime).toLocaleTimeString(),
            bike: booking.bikeType?.name || "Bikes",
            quantity: String(booking.quantity),
            customerName: booking.customerName,
            pickupUrl,
            tenantName: booking.tenant?.name || booking.tenantSlug || "MTB Reserve",
            tenantEmail: booking.tenant?.contactEmail || "",
        },
        {
            subject: "Booking Confirmed!",
            html: `<h1>Ready to ride!</h1><p>Your booking is confirmed.</p><ul><li><strong>Date:</strong> ${new Date(booking.startTime).toLocaleString()}</li><li><strong>Bikes:</strong> ${booking.quantity}x ${booking.bikeType?.name || "Bikes"}</li></ul><p>See you soon!</p>`,
        }
    );

    return sendEmail({
        from,
        to,
        subject,
        html,
        text: stripHtml(html),
        category: "recap",
        entityId: booking.id,
        tags: [
            { name: "category", value: "recap" },
            { name: "tenant", value: routeSlug || "unknown" },
        ],
    });
}

export async function sendAdminNotification(tenantEmail: string, booking: BookingEmailData) {
    const { subject, html, from } = await getTemplateContent(
        "admin_notification",
        {
            customerName: booking.customerName,
            customerPhone: booking.customerPhone || "",
            customerEmail: booking.customerEmail,
            date: new Date(booking.startTime).toLocaleDateString(),
            time: new Date(booking.startTime).toLocaleTimeString(),
            bike: booking.bikeType?.name || "Bikes",
            quantity: String(booking.quantity),
            bookingCode: booking.bookingCode || "N/A",
        },
        {
            subject: `New Booking: ${booking.customerName}`,
            html: `<p>New booking confirmed!</p><ul><li><strong>Customer:</strong> ${booking.customerName} (${booking.customerPhone})</li><li><strong>Date:</strong> ${new Date(booking.startTime).toLocaleString()}</li><li><strong>Qty:</strong> ${booking.quantity}</li></ul>`,
        }
    );

    return sendEmail({
        from,
        to: tenantEmail,
        subject,
        html,
        text: stripHtml(html),
        category: "admin_notification",
        entityId: `admin_${booking.id}`,
        tags: [
            { name: "category", value: "admin_notification" },
            { name: "tenant", value: booking.tenantSlug || "unknown" },
        ],
    });
}

export async function sendTenantOnboardingEmail({
    name,
    registrationEmail,
    password,
    routeSlug,
}: {
    name: string;
    registrationEmail: string;
    password: string;
    routeSlug: string;
}) {
    const loginUrl = `${getBaseUrl()}/${routeSlug}/admin/login`;
    const { subject, html, from } = await getTemplateContent(
        "onboarding",
        {
            name,
            slug: routeSlug,
            registrationEmail,
            password,
            loginUrl,
        },
        {
            subject: "Welcome to MTB Reserve - Your Admin Access",
            html: `<h1>Welcome, ${name}!</h1><p>Your tenant account has been created.</p><p><strong>Login:</strong> <a href="${loginUrl}">${loginUrl}</a></p><p><strong>Username:</strong> ${registrationEmail}</p><p><strong>Password:</strong> ${password}</p>`,
        }
    );

    return sendEmail({
        from,
        to: registrationEmail,
        subject,
        html,
        text: stripHtml(html),
        category: "onboarding",
        entityId: routeSlug,
        tags: [
            { name: "category", value: "onboarding" },
            { name: "tenant", value: routeSlug },
        ],
    });
}

export async function sendPasswordResetTemplateEmail({
    to,
    tenantName,
    link,
    entityId,
}: {
    to: string;
    tenantName: string;
    link: string;
    entityId: string;
}) {
    const { subject, html, from } = await getTemplateContent(
        "password_reset",
        { tenantName, link },
        {
            subject: `Reset Password for ${tenantName}`,
            html: `<p>You requested a password reset. Click below to continue:</p><p><a href="${link}">${link}</a></p>`,
        }
    );

    return sendEmail({
        from,
        to,
        subject,
        html,
        text: stripHtml(html),
        category: "password_reset",
        entityId,
    });
}

export async function sendSignupRequestAdminNotification(
    formData: {
        firstName: string;
        lastName: string;
        organization: string;
        email: string;
        phone: string;
        address?: string | null;
        message?: string | null;
    },
    extras?: { publicSlug?: string; loginUrl?: string; password?: string; duplicate?: boolean }
) {
    const settings = await getSiteSettings();
    const adminEmail = settings.adminNotificationEmail || DEFAULT_CONTACT_EMAIL;

    const { subject, html, from } = await getTemplateContent(
        "signup_request_admin",
        {
            ...formData,
            address: formData.address || "",
            message: formData.message || "",
            publicSlug: extras?.publicSlug || "",
            loginUrl: extras?.loginUrl || "",
            password: extras?.password || "",
            duplicate: extras?.duplicate ? "yes" : "no",
        },
        {
            subject: `New Join Request: ${formData.organization || formData.firstName}`,
            html: `
                <h2>New Join Request</h2>
                <p><strong>Name:</strong> ${formData.firstName} ${formData.lastName}</p>
                <p><strong>Organization:</strong> ${formData.organization}</p>
                <p><strong>Email:</strong> ${formData.email}</p>
                <p><strong>Phone:</strong> ${formData.phone}</p>
                <p><strong>Location:</strong> ${formData.address || "-"}</p>
                <p><strong>Fleet Details:</strong></p>
                <p style="background:#f4f4f4; padding:10px; border-radius:4px;">${escapeHtml(formData.message || "No message provided.")}</p>
                ${extras?.publicSlug ? `<p><strong>Public slug:</strong> ${extras.publicSlug}</p>` : ""}
                ${extras?.loginUrl ? `<p><strong>Login URL:</strong> <a href="${extras.loginUrl}">${extras.loginUrl}</a></p>` : ""}
                ${extras?.duplicate ? `<p><strong>Duplicate detected:</strong> yes</p>` : ""}
            `,
        }
    );

    return sendEmail({
        from,
        to: adminEmail,
        subject,
        html,
        text: stripHtml(html),
        category: "signup_request_admin",
        tags: [{ name: "category", value: "signup_request_admin" }],
    });
}

export async function sendBookingStatusChangeEmail(booking: BookingEmailData, status: string) {
    const statusMap: Record<string, string> = {
        CANCELLED: "booking_cancelled",
        NO_SHOW: "booking_no_show",
    };

    const templateId = statusMap[status];
    if (!templateId) {
        console.warn(`No email template found for status: ${status}`);
        return { error: "No template for status" };
    }

    const { subject, html, from } = await getTemplateContent(
        templateId,
        {
            customerName: booking.customerName,
            bookingCode: booking.bookingCode || "N/A",
            date: new Date(booking.startTime).toLocaleDateString(),
            bike: booking.bikeType?.name || "Bikes",
            tenantName: booking.tenantSlug || "MTB Reserve",
        },
        {
            subject: `Booking Update: ${status}`,
            html: `<p>Your booking status has been updated to: <strong>${status}</strong></p>`,
        }
    );

    return sendEmail({
        from,
        to: booking.customerEmail,
        subject,
        html,
        text: stripHtml(html),
        category: templateId,
        entityId: booking.id,
        tags: [
            { name: "category", value: templateId },
            { name: "tenant", value: booking.tenantSlug || "unknown" },
        ],
    });
}
