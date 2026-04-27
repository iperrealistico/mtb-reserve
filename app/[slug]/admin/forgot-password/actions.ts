"use server";

// ... imports
import { db } from "@/lib/db";
import { randomUUID } from "crypto";
import { addMinutes } from "date-fns";
import { redirect } from "next/navigation";
import { sendPasswordResetTemplateEmail } from "@/lib/email";
import { rateLimit } from "@/lib/rate-limit";
import { headers } from "next/headers";
import { getTenantBySlug, getTenantRouteSlug } from "@/lib/tenants";
// Removed verifyRecaptcha import

export async function requestPasswordResetAction(formData: FormData) {
    const slug = formData.get("slug") as string;
    const email = formData.get("email") as string;

    if (!slug || !email) {
        return redirect(`/${slug}/admin/forgot-password?error=Email is required`);
    }

    // 1. Rate Limit
    const headerList = await headers();
    const ip = headerList.get("x-forwarded-for") || "127.0.0.1";

    // 3 attempts per hour
    const limitResult = await rateLimit(`forgot_password:${ip}`, 3, 3600);
    if (!limitResult.success) {
        return redirect(`/${slug}/admin/forgot-password?error=Too many requests. Try again later.`);
    }

    // 2. ReCAPTCHA - REMOVED

    // 2. Find Tenant
    const tenant = await getTenantBySlug(slug);

    // 3. Verify Email matches Registration Email
    if (tenant && tenant.registrationEmail.toLowerCase() === email.toLowerCase()) {
        // 4. Generate Token
        const token = randomUUID();
        const expiresAt = addMinutes(new Date(), 15); // 15 min expiry

        await db.tenant.update({
            where: { slug: tenant.slug },
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
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://www.mtbreserve.com";
        const link = `${baseUrl}/${getTenantRouteSlug(tenant)}/admin/reset-password?token=${token}`;

        await sendPasswordResetTemplateEmail({
            to: email,
            tenantName: tenant.name,
            link,
            entityId: tenant.slug,
        });
    }

    // Always redirect to success to prevent enumeration
    redirect(`/${slug}/admin/forgot-password/sent`);
}
