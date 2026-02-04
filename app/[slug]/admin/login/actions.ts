"use server";

import { getSession, verifyPassword } from "@/lib/auth";
import { getTenantBySlug } from "@/lib/tenants";
import { RateLimiterMemory } from "rate-limiter-flexible";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

// MVP: In-memory rate limiter. 
// Note: In serverless (Vercel), this memory is not shared across lambdas.
// For production, use Redis or Database store as requested.
// We are using memory here for initial simplicity but this SHOULD be upgraded.
const rateLimiter = new RateLimiterMemory({
    points: 5, // 5 attempts
    duration: 60 * 15, // per 15 minutes
});

export async function loginAction(prevState: any, formData: FormData) {
    const slug = formData.get("slug") as string;
    const password = formData.get("password") as string;

    if (!slug || !password) {
        return { error: "Missing slug or password" };
    }

    // 1. Rate Limiting
    const headerList = await headers();
    const ip = headerList.get("x-forwarded-for") || "unknown";
    try {
        await rateLimiter.consume(ip);
    } catch (rej) {
        return { error: "Too many login attempts. Please try again later." };
    }

    // 2. Fetch Tenant
    const tenant = await getTenantBySlug(slug);
    if (!tenant) {
        // Security: Don't reveal tenant existence? 
        // But URL is /[slug]/admin, so slug validity is known.
        // However, for login form, we can just say "Invalid credentials"
        return { error: "Invalid credentials" };
    }

    // 3. Verify Password
    const isValid = await verifyPassword(password, tenant.adminPasswordHash);

    if (!isValid) {
        return { error: "Invalid credentials" };
    }

    // 4. Create Session
    const session = await getSession();
    session.tenantSlug = tenant.slug;
    session.isLoggedIn = true;
    await session.save();

    redirect(`/${slug}/admin/dashboard`);
}
