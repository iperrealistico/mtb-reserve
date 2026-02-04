
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY || "re_mock_key");
const FROM_EMAIL = process.env.FROM_EMAIL || "onboarding@resend.dev";
const IS_DEV = process.env.NODE_ENV === "development" && process.env.EMAIL_DISABLED !== "false";

// If EMAIL_DISABLED is "1" or "true", we log instead of send.
// In dev, usually we want to log unless explicitly enabled.
const SHOULD_LOG = process.env.EMAIL_DISABLED === "1" || !process.env.RESEND_API_KEY;

export async function sendConfirmationLink(to: string, slug: string, token: string) {
    const link = `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/${slug}/confirm?token=${token}`;

    if (SHOULD_LOG) {
        console.log(`[📧 MOCK EMAIL] To: ${to} | Subject: Confirm your Booking | Link: ${link}`);
        return { success: true };
    }

    try {
        await resend.emails.send({
            from: FROM_EMAIL,
            to,
            subject: "Confirm your MTB Booking",
            html: `<p>Please click here to confirm your booking: <a href="${link}">${link}</a></p><p>This link expires in 30 minutes.</p>`
        });
        return { success: true };
    } catch (error) {
        console.error("Resend Error:", error);
        return { error };
    }
}

export async function sendBookingRecap(to: string, booking: any) {
    if (SHOULD_LOG) {
        console.log(`[📧 MOCK EMAIL] To: ${to} | Subject: Booking Confirmed | ID: ${booking.id}`);
        return { success: true };
    }

    try {
        await resend.emails.send({
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
        return { success: true };
    } catch (error) {
        console.error("Resend Error:", error);
        return { error };
    }
}

export async function sendAdminNotification(tenantEmail: string, booking: any) {
    if (SHOULD_LOG) {
        console.log(`[📧 MOCK EMAIL ADMIN] To: ${tenantEmail} | Subject: New Booking!`);
        return { success: true };
    }

    try {
        await resend.emails.send({
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
        return { success: true };
    } catch (error) {
        console.error("Resend Error:", error);
        return { error };
    }
}
