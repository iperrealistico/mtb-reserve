
import { Resend } from 'resend';
import { logEvent } from "@/lib/events";

const resend = new Resend(process.env.RESEND_API_KEY || "re_mock_key");
const FROM_EMAIL = process.env.FROM_EMAIL || "onboarding@resend.dev";
const IS_DEV = process.env.NODE_ENV === "development" && process.env.EMAIL_DISABLED !== "false";

// If EMAIL_DISABLED is "1" or "true", we log instead of send.
// In dev, usually we want to log unless explicitly enabled.
const SHOULD_LOG = process.env.EMAIL_DISABLED === "1" || !process.env.RESEND_API_KEY;

export async function sendConfirmationLink(to: string, slug: string, token: string) {
    const link = `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/${slug}/booking/confirm/${token}`;

    if (SHOULD_LOG) {
        console.log(`[📧 MOCK EMAIL] To: ${to} | Subject: Confirm your Booking | Link: ${link}`);
        await logEvent({ level: "INFO", actorType: "SYSTEM", eventType: "EMAIL_SENT_MOCK", message: "Mock confirmation email", metadata: { to } });
        return { success: true };
    }

    try {
        const { data, error } = await resend.emails.send({
            from: FROM_EMAIL,
            to,
            subject: "Confirm your MTB Booking",
            html: `<p>Please click here to confirm your booking: <a href="${link}">${link}</a></p><p>This link expires in 30 minutes.</p>`
        });

        if (error) throw error;

        await logEvent({
            level: "INFO",
            actorType: "SYSTEM",
            eventType: "EMAIL_SENT",
            message: "Confirmation email sent",
            metadata: { to, providerId: data?.id, type: "confirmation_link" }
        });
        return { success: true };
    } catch (error: any) {
        console.error("Resend Error:", error);
        await logEvent({
            level: "ERROR",
            actorType: "SYSTEM",
            eventType: "EMAIL_FAILED",
            message: "Failed to send confirmation email",
            metadata: { to, error: error.message || error }
        });
        return { error };
    }
}

export async function sendBookingRecap(to: string, booking: any) {
    if (SHOULD_LOG) {
        console.log(`[📧 MOCK EMAIL] To: ${to} | Subject: Booking Confirmed | ID: ${booking.id}`);
        await logEvent({ level: "INFO", actorType: "SYSTEM", eventType: "EMAIL_SENT_MOCK", message: "Mock recap email", metadata: { to } });
        return { success: true };
    }

    try {
        const { data, error } = await resend.emails.send({
            from: FROM_EMAIL,
            to,
            subject: "Booking Confirmed! 🚴",
            html: `
                <h1>Ready to ride!</h1>
                <p>Your booking is confirmed.</p>
                <ul>
                    <li><strong>Date:</strong> ${new Date(booking.startTime).toLocaleString()}</li>
                    <li><strong>Bikes:</strong> ${booking.quantity}x ${booking.bikeType?.name || "Bikes"}</li>
                </ul>
                <p>See you soon!</p>
            `
        });
        if (error) throw error;

        await logEvent({
            level: "INFO",
            actorType: "SYSTEM",
            eventType: "EMAIL_SENT",
            message: "Booking recap email sent",
            metadata: { to, providerId: data?.id, type: "recap" }
        });
        return { success: true };
    } catch (error: any) {
        console.error("Resend Error:", error);
        await logEvent({
            level: "ERROR",
            actorType: "SYSTEM",
            eventType: "EMAIL_FAILED",
            message: "Failed to send recap email",
            metadata: { to, error: error.message || error }
        });
        return { error };
    }
}

export async function sendAdminNotification(tenantEmail: string, booking: any) {
    if (SHOULD_LOG) {
        console.log(`[📧 MOCK EMAIL ADMIN] To: ${tenantEmail} | Subject: New Booking!`);
        return { success: true };
    }

    try {
        const { data, error } = await resend.emails.send({
            from: FROM_EMAIL,
            to: tenantEmail,
            subject: `New Booking: ${booking.customerName}`,
            html: `
                <p>New booking confirmed!</p>
                <ul>
                    <li><strong>Customer:</strong> ${booking.customerName} (${booking.customerPhone})</li>
                    <li><strong>Date:</strong> ${new Date(booking.startTime).toLocaleString()}</li>
                    <li><strong>Qty:</strong> ${booking.quantity}</li>
                </ul>
            `
        });
        if (error) throw error;

        await logEvent({
            level: "INFO",
            actorType: "SYSTEM",
            eventType: "EMAIL_SENT",
            message: "Admin notification email sent",
            metadata: { to: tenantEmail, providerId: data?.id, type: "admin_notify" }
        });
        return { success: true };
    } catch (error: any) {
        console.error("Resend Error:", error);
        await logEvent({
            level: "ERROR",
            actorType: "SYSTEM",
            eventType: "EMAIL_FAILED",
            message: "Failed to send admin notification",
            metadata: { to: tenantEmail, error: error.message || error }
        });
        return { error };
    }
}

export async function sendEmail({ to, subject, html }: { to: string, subject: string, html: string }) {
    if (SHOULD_LOG) {
        console.log(`[📧 MOCK EMAIL] To: ${to} | Subject: ${subject}`);
        await logEvent({ level: "INFO", actorType: "SYSTEM", eventType: "EMAIL_SENT_MOCK", message: `Mock email: ${subject}`, metadata: { to } });
        return { success: true };
    }

    try {
        const { data, error } = await resend.emails.send({
            from: FROM_EMAIL,
            to,
            subject,
            html,
        });

        if (error) throw error;

        await logEvent({
            level: "INFO",
            actorType: "SYSTEM",
            eventType: "EMAIL_SENT",
            message: "Email sent",
            metadata: { to, subject, providerId: data?.id, type: "generic" }
        });

        return { success: true };
    } catch (error: any) {
        console.error("Resend Error:", error);
        await logEvent({
            level: "ERROR",
            actorType: "SYSTEM",
            eventType: "EMAIL_FAILED",
            message: "Failed to send email",
            metadata: { to, subject, error: error.message || error }
        });
        return { error };
    }
}
