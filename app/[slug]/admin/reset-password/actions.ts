"use server";

import { db } from "@/lib/db";
import { hashPassword, generateSecureItalianPassword } from "@/lib/auth";
import { redirect } from "next/navigation";
import { sendEmail } from "@/lib/email";

export async function resetPasswordAction(prevState: any, formData: FormData) {
    const slug = formData.get("slug") as string;
    const token = formData.get("token") as string;

    if (!slug || !token) return { success: false, error: "Invalid request" };

    // 1. Validate Token
    const tenant = await db.tenant.findFirst({
        where: {
            slug,
            passwordResetToken: token,
            passwordResetExpires: { gt: new Date() } // Must not be expired
        }
    });

    if (!tenant) {
        return { error: "Invalid or expired token. Please request a new implementation." };
    }

    // 2. Generate New Password
    const newPassword = generateSecureItalianPassword();
    const newHash = await hashPassword(newPassword);

    // 3. Update Tenant
    await db.tenant.update({
        where: { slug },
        data: {
            adminPasswordHash: newHash,
            tokenVersion: { increment: 1 }, // Invalidate sessions
            passwordResetToken: null, // Consume token (Single Use)
            passwordResetExpires: null,
        }
    });

    // 4. Email New Password (as required)
    // Requirement: "Plaintext may only appear to the tenant via email during reset, never in UI"

    await sendEmail({
        to: tenant.contactEmail,
        subject: `Your New Password for ${tenant.name}`,
        category: 'password_reset',
        entityId: slug,
        html: `
            <p>Your password has been reset successfully.</p>
            <p><strong>New Password:</strong> ${newPassword}</p>
            <p>Please keep this password safe.</p>
        `,
    });

    // Do NOT return the password to the client component
    return { success: true, error: "" };
}

// Ensure type compatibility when error occurs
// Type should be { success: boolean, newPassword?: string, error: string }
// If previous calls returned { error: "..." }, add success: false
