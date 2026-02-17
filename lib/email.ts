import { db } from "@/lib/db";
import { Resend } from 'resend';
import { logEvent } from "@/lib/events";
import { getSiteSettings } from "@/lib/site-settings";

const resend = new Resend(process.env.RESEND_API_KEY || "re_mock_key");
const DEFAULT_FROM_EMAIL = "MTB Reserve <direct@mtbreserve.com>";
const SHOULD_LOG = process.env.EMAIL_DISABLED === "1" || !process.env.RESEND_API_KEY;

// Template Helper
async function getTemplateContent(id: string, placeholders: Record<string, string>, defaults: { subject: string, html: string }) {
    let { subject, html } = defaults;
    let senderName = "MTB Reserve";
    let senderEmail = "direct@mtbreserve.com";

    try {
        const template = await (db as any).emailTemplate.findUnique({ where: { id } });
        if (template) {
            subject = template.subject;
            html = template.html;
            if (template.senderName) senderName = template.senderName;
            if (template.senderEmail) senderEmail = template.senderEmail;
        }
    } catch (e) {
        console.error(`Failed to fetch template ${id}`, e);
    }

    const replace = (text: string) => {
        let res = text;
        for (const [k, v] of Object.entries(placeholders)) {
            res = res.replaceAll(`{{${k}}}`, v || "");
        }
        return res;
    };

    return {
        subject: replace(subject),
        html: replace(html),
        from: `${senderName} <${senderEmail}>`
    };
}

export async function sendConfirmationLink(to: string, slug: string, token: string) {
    const link = `${process.env.NEXT_PUBLIC_BASE_URL}/${slug}/booking/confirm/${token}`;

    const { subject, html, from } = await getTemplateContent("confirmation", { link, tenantName: slug }, {
        subject: "Confirm your MTB Booking",
        html: `<p>Please click here to confirm your booking: <a href="${link}">${link}</a></p><p>This link expires in 30 minutes.</p>`
    });

    if (SHOULD_LOG) {
        console.log(`[MOCK EMAIL] To: ${to} | From: ${from} | Subject: ${subject}`);
        await logEvent({
            level: "INFO",
            actorType: "SYSTEM",
            eventType: "EMAIL_SENT_MOCK",
            message: `Mock email: ${subject}`,
            metadata: { to, subject, type: "confirmation_link", providerId: "mock-id" }
        });
        return { success: true };
    }

    try {
        const { data, error } = await resend.emails.send({
            from,
            to,
            subject,
            html,
            headers: { 'X-Entity-Ref-ID': token },
            tags: [
                { name: 'category', value: 'confirmation' },
                { name: 'tenant', value: slug }
            ]
        });

        if (error) throw error;

        await logEvent({
            level: "INFO",
            actorType: "SYSTEM",
            eventType: "EMAIL_SENT",
            message: "Confirmation email sent",
            metadata: { to, subject, providerId: data?.id, type: "confirmation_link" }
        });
        return { success: true };
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : String(error);
        await logEvent({
            level: "ERROR",
            actorType: "SYSTEM",
            eventType: "EMAIL_FAILED",
            message: "Failed to send confirmation email",
            metadata: { to, subject, type: "confirmation_link", error: message }
        });
        return { error };
    }
}

export async function sendBookingRecap(to: string, booking: any) {
    const { subject, html, from } = await getTemplateContent("recap", {
        bookingCode: booking.bookingCode || "N/A",
        date: new Date(booking.startTime).toLocaleDateString(),
        time: new Date(booking.startTime).toLocaleTimeString(),
        bike: booking.bikeType?.name || "Bikes",
        quantity: String(booking.quantity),
        customerName: booking.customerName,
        tenantName: booking.tenantSlug || "MTB Reserve",
        pickupUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/${booking.tenantSlug}`
    }, {
        subject: "Booking Confirmed!",
        html: `<h1>Ready to ride!</h1><p>Your booking is confirmed.</p><ul><li><strong>Date:</strong> ${new Date(booking.startTime).toLocaleString()}</li><li><strong>Bikes:</strong> ${booking.quantity}x ${booking.bikeType?.name || "Bikes"}</li></ul><p>See you soon!</p>`
    });

    if (SHOULD_LOG) {
        console.log(`[MOCK EMAIL] To: ${to} | From: ${from} | Subject: ${subject}`);
        await logEvent({
            level: "INFO",
            actorType: "SYSTEM",
            eventType: "EMAIL_SENT_MOCK",
            message: `Mock recap email`,
            metadata: { to, subject, type: "recap", providerId: "mock-id" }
        });
        return { success: true };
    }

    try {
        const { data, error } = await resend.emails.send({
            from,
            to,
            subject,
            html,
            headers: { 'X-Entity-Ref-ID': booking.id },
            tags: [
                { name: 'category', value: 'recap' },
                { name: 'tenant', value: booking.tenantSlug || 'unknown' }
            ]
        });
        if (error) throw error;

        await logEvent({
            level: "INFO",
            actorType: "SYSTEM",
            eventType: "EMAIL_SENT",
            message: "Booking recap email sent",
            metadata: { to, subject, providerId: data?.id, type: "recap" }
        });
        return { success: true };
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : String(error);
        await logEvent({
            level: "ERROR",
            actorType: "SYSTEM",
            eventType: "EMAIL_FAILED",
            message: "Failed to send recap email",
            metadata: { to, subject, type: "recap", error: message }
        });
        return { error };
    }
}

export async function sendAdminNotification(tenantEmail: string, booking: any) {
    const { subject, html, from } = await getTemplateContent("admin_notification", {
        customerName: booking.customerName,
        customerPhone: booking.customerPhone,
        customerEmail: booking.customerEmail,
        date: new Date(booking.startTime).toLocaleDateString(),
        time: new Date(booking.startTime).toLocaleTimeString(),
        bike: booking.bikeType?.name || "Bikes",
        quantity: String(booking.quantity),
        bookingCode: booking.bookingCode || "N/A"
    }, {
        subject: `New Booking: ${booking.customerName}`,
        html: `<p>New booking confirmed!</p><ul><li><strong>Customer:</strong> ${booking.customerName} (${booking.customerPhone})</li><li><strong>Date:</strong> ${new Date(booking.startTime).toLocaleString()}</li><li><strong>Qty:</strong> ${booking.quantity}</li></ul>`
    });

    if (SHOULD_LOG) {
        console.log(`[MOCK EMAIL ADMIN] To: ${tenantEmail} | From: ${from} | Subject: ${subject}`);
        await logEvent({
            level: "INFO",
            actorType: "SYSTEM",
            eventType: "EMAIL_SENT_MOCK",
            message: `Mock admin notification`,
            metadata: { to: tenantEmail, subject, type: "admin_notify", providerId: "mock-id" }
        });
        return { success: true };
    }

    try {
        const { data, error } = await resend.emails.send({
            from,
            to: tenantEmail,
            subject,
            html,
            headers: { 'X-Entity-Ref-ID': `admin_${booking.id}` },
            tags: [
                { name: 'category', value: 'admin_notification' },
                { name: 'tenant', value: booking.tenantSlug || 'unknown' }
            ]
        });
        if (error) throw error;

        await logEvent({
            level: "INFO",
            actorType: "SYSTEM",
            eventType: "EMAIL_SENT",
            message: "Admin notification email sent",
            metadata: { to: tenantEmail, subject, providerId: data?.id, type: "admin_notify" }
        });
        return { success: true };
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : String(error);
        await logEvent({
            level: "ERROR",
            actorType: "SYSTEM",
            eventType: "EMAIL_FAILED",
            message: "Failed to send admin notification",
            metadata: { to: tenantEmail, subject, type: "admin_notify", error: message }
        });
        return { error };
    }
}

// Helper for logging mock emails
async function logMockEmail(to: string, from: string, subject: string, actorType: "GUEST" | "SYSTEM" = "GUEST", eventType: string = "EMAIL_SENT_MOCK", message: string = "Mock email", type: string = "generic") {
    console.log(`[MOCK EMAIL] To: ${to} | From: ${from} | Subject: ${subject}`);
    await logEvent({
        level: "INFO",
        actorType,
        eventType,
        message: `${message}: ${subject}`,
        metadata: { to, subject, type, providerId: "mock-id" }
    });
}

export async function sendSignupRequest(formData: any) {
    const { firstName, lastName, organization, email, phone, address, message } = formData;

    // 1. Get Settings for Admin Email
    const settings = await getSiteSettings();
    const adminEmail = settings.adminNotificationEmail || "contact@mtbreserve.com";

    // 2. Prepare Template Data
    const data = { firstName, lastName, organization, email, phone, address, message };

    let userResData: any = {};
    let adminResData: any = {};

    // 3. Send User Acknowledgment
    try {
        const { subject, html, from } = await getTemplateContent("signup_request", data, {
            subject: "We received your request!",
            html: `<h1>Hi ${firstName},</h1><p>Thanks for your interest. We received your request: ${organization}.</p>`
        });

        if (SHOULD_LOG) {
            await logMockEmail(email, from, subject, "GUEST", "EMAIL_SENT_MOCK", "Mock signup user email", "signup_request_user");
        } else {
            const { data: resendData, error: resendError } = await resend.emails.send({
                from,
                to: email,
                subject,
                html,
                tags: [{ name: 'category', value: 'signup_request_user' }]
            });
            if (resendError) throw resendError;
            userResData = resendData;

            await logEvent({
                level: "INFO",
                actorType: "SYSTEM",
                eventType: "EMAIL_SENT",
                message: "Signup acknowledgement sent to user",
                metadata: { to: email, subject, type: "signup_request_user", providerId: resendData?.id }
            });
        }
    } catch (e) {
        console.error("Failed to send signup user email", e);
    }

    // 4. Send Admin Notification
    try {
        const { subject, html, from } = await getTemplateContent("signup_request_admin", data, {
            subject: `New Join Request: ${organization || firstName}`,
            html: `
                <h2>New Join Request</h2>
                <p><strong>Name:</strong> ${firstName} ${lastName}</p>
                <p><strong>Organization:</strong> ${organization}</p>
                <p><strong>Email:</strong> ${email}</p>
                <p><strong>Phone:</strong> ${phone}</p>
                <p><strong>Location:</strong> ${address}</p>
                <p><strong>Fleet Details:</strong></p>
                <p style="background:#f4f4f4; padding:10px; border-radius:4px;">${message}</p>
            `
        });

        if (SHOULD_LOG) {
            await logMockEmail(adminEmail, from, subject, "GUEST", "EMAIL_SENT_MOCK", "Mock signup admin email", "signup_request_admin");
        } else {
            const { data: resendData, error: resendError } = await resend.emails.send({
                from,
                to: adminEmail,
                subject,
                html,
                tags: [{ name: 'category', value: 'signup_request_admin' }]
            });
            if (resendError) throw resendError;
            adminResData = resendData;

            await logEvent({
                level: "INFO",
                actorType: "SYSTEM",
                eventType: "EMAIL_SENT",
                message: "Signup notification sent to admin",
                metadata: { to: adminEmail, subject, type: "signup_request_admin", providerId: resendData?.id }
            });
        }
    } catch (e) {
        console.error("Failed to send signup admin email", e);
    }

    return { success: true };
}

export async function sendEmail({ to, subject, html, category = 'generic', entityId }: { to: string, subject: string, html: string, category?: string, entityId?: string }) {
    if (SHOULD_LOG) {
        console.log(`[MOCK EMAIL] To: ${to} | Subject: ${subject}`);
        await logEvent({
            level: "INFO",
            actorType: "SYSTEM",
            eventType: "EMAIL_SENT_MOCK",
            message: `Mock email: ${subject}`,
            metadata: { to, subject, type: category, providerId: "mock-id" }
        });
        return { success: true };
    }

    // Default sender
    const from = DEFAULT_FROM_EMAIL;

    try {
        const { data, error } = await resend.emails.send({
            from,
            to,
            subject,
            html,
            headers: entityId ? { 'X-Entity-Ref-ID': entityId } : undefined,
            tags: [{ name: 'category', value: category }]
        });

        if (error) throw error;

        await logEvent({
            level: "INFO",
            actorType: "SYSTEM",
            eventType: "EMAIL_SENT",
            message: "Email sent",
            metadata: { to, subject, providerId: data?.id, type: category }
        });

        return { success: true };
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : String(error);
        await logEvent({
            level: "ERROR",
            actorType: "SYSTEM",
            eventType: "EMAIL_FAILED",
            message: "Failed to send email",
            metadata: { to, subject, type: category, error: message }
        });
        return { error };
    }
}

export async function sendBookingStatusChangeEmail(booking: any, status: string) {
    const statusMap: Record<string, string> = {
        "CANCELLED": "booking_cancelled",
        "NO_SHOW": "booking_no_show"
    };

    const templateId = statusMap[status];
    if (!templateId) {
        console.warn(`No email template found for status: ${status}`);
        return { error: "No template for status" };
    }

    const { subject, html, from } = await getTemplateContent(templateId, {
        customerName: booking.customerName,
        bookingCode: booking.bookingCode || "N/A",
        date: new Date(booking.startTime).toLocaleDateString(),
        bike: booking.bikeType?.name || "Bikes",
        tenantName: booking.tenantSlug || "MTB Reserve"
    }, {
        subject: `Booking Update: ${status}`,
        html: `<p>Your booking status has been updated to: <strong>${status}</strong></p>`
    });

    if (SHOULD_LOG) {
        console.log(`[MOCK EMAIL] Status Update (${status}) To: ${booking.customerEmail} | From: ${from} | Subject: ${subject}`);
        await logEvent({
            level: "INFO",
            actorType: "SYSTEM",
            eventType: "EMAIL_SENT_MOCK",
            message: `Mock status update email`,
            metadata: { to: booking.customerEmail, subject, type: templateId, providerId: "mock-id" }
        });
        return { success: true };
    }

    try {
        const { data, error } = await resend.emails.send({
            from,
            to: booking.customerEmail,
            subject,
            html,
            headers: { 'X-Entity-Ref-ID': booking.id },
            tags: [
                { name: 'category', value: templateId },
                { name: 'tenant', value: booking.tenantSlug || 'unknown' }
            ]
        });

        if (error) throw error;

        await logEvent({
            level: "INFO",
            actorType: "SYSTEM",
            eventType: "EMAIL_SENT",
            message: `Booking ${status} email sent`,
            metadata: { to: booking.customerEmail, subject, providerId: data?.id, type: templateId }
        });
        return { success: true };
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : String(error);
        await logEvent({
            level: "ERROR",
            actorType: "SYSTEM",
            eventType: "EMAIL_FAILED",
            message: `Failed to send ${status} email`,
            metadata: { to: booking.customerEmail, subject, type: templateId, error: message }
        });
        return { error };
    }
}
