"use server";

import { db } from "@/lib/db";
import { randomUUID } from "crypto";
import { addMinutes } from "date-fns";
import { redirect } from "next/navigation";
import { sendEmail } from "@/lib/email";
import { rateLimit } from "@/lib/rate-limit";
import { headers } from "next/headers";
import { verifyRecaptcha } from "@/lib/recaptcha";

export async function requestPasswordResetAction(formData: FormData) {
    const slug = formData.get("slug") as string;
    const email = formData.get("email") as string;

    if (!slug || !email) {
        return { error: "Email is required" };
    }

    // 1. Rate Limit
    const headerList = await headers();
    const ip = headerList.get("x-forwarded-for") || "127.0.0.1";

    // 3 attempts per hour
    const limitResult = await rateLimit(`forgot_password:${ip}`, 3, 3600);
    if (!limitResult.success) {
        return redirect(`/${slug}/admin/forgot-password?error=Too many requests. Try again later.`);
    }

    // 2. ReCAPTCHA
    const captchaToken = formData.get("recaptchaToken") as string;
    const isHuman = await verifyRecaptcha(captchaToken);
    if (!isHuman) {
        return redirect(`/${slug}/admin/forgot-password?error=Security check failed. Please try again.`);
    }

    // 2. Find Tenant
    const tenant = await db.tenant.findUnique({
        where: { slug },
    });

    // 3. Verify Email matches Contact Email
    if (tenant && tenant.contactEmail.toLowerCase() === email.toLowerCase()) {
        // 4. Generate Token
        const token = randomUUID();
        const expiresAt = addMinutes(new Date(), 15); // 15 min expiry

        await db.tenant.update({
            where: { slug },
            data: {
                passwordResetToken: token,
                passwordResetExpires: expiresAt,
            },
        });

        // 5. Send Email
        // Construct Link
        // Need BASE_URL. For now, assume VERCEL_URL or localhost.
        // In server actions, keeping it relative or inferring is hard. 
        // We need an env var `NEXT_PUBLIC_BASE_URL` or similar. 
        // Fallback: headers host.

        // Let's assume process.env.NEXT_PUBLIC_BASE_URL for now or hardcode for MVP if missing.
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
        const link = `${baseUrl}/${slug}/admin/reset-password?token=${token}`;

        await sendEmail({
            to: email,
            subject: `Reset Password for ${tenant.name}`,
            html: `
                <p>Hello,</p>
                <p>You requested a password reset for <strong>${tenant.name}</strong>.</p>
                <p>Click the link below to reset your password (valid for 15 minutes):</p>
                <p><a href="${link}">${link}</a></p>
                <p>If you didn't request this, please ignore this email.</p>
            `,
        });
    }

    // Always redirect to success to prevent enumeration
    redirect(`/${slug}/admin/forgot-password/sent`);
}
