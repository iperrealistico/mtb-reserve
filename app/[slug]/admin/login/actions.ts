"use server";

// ... imports
import { getSession, verifyPassword } from "@/lib/auth";
import { getTenantBySlug } from "@/lib/tenants";
import { rateLimit } from "@/lib/rate-limit";
// Removed verifyRecaptcha import
import { headers } from "next/headers";
import { redirect } from "next/navigation";


import { logEvent } from "@/lib/events";


export async function loginAction(prevState: any, formData: FormData) {
    const slug = formData.get("slug") as string;
    const password = formData.get("password") as string;
    // Removed token retrieval

    if (!slug || !password) {
        return { error: "Missing slug or password" };
    }

    // 1. Rate Limiting
    const headerList = await headers();
    const ip = headerList.get("x-forwarded-for") || "127.0.0.1";

    const limitResult = await rateLimit(`tenant_login:${ip}`, 5, 900); // 5 attempts per 15 min
    if (!limitResult.success) {
        // Log generic failure? Maybe too noisy.
        return { error: "Too many login attempts. Please try again later." };
    }

    // 2. ReCAPTCHA - REMOVED


    // 2. Fetch Tenant
    const tenant = await getTenantBySlug(slug);
    if (!tenant) {
        await logEvent({
            level: "WARN",
            actorType: "GUEST",
            eventType: "LOGIN_FAILURE",
            message: "Tenant login failed: tenant not found",
            metadata: { slug, reason: "Tenant not found" }
        });
        return { error: "Invalid credentials" };
    }

    // 3. Verify Password
    const isValid = await verifyPassword(password, tenant.adminPasswordHash);

    if (!isValid) {
        await logEvent({
            level: "WARN",
            actorType: "TENANT_ADMIN",
            tenantId: tenant.slug,
            eventType: "LOGIN_FAILURE",
            message: "Tenant login failed: invalid password"
        });
        return { error: "Invalid credentials" };
    }

    await logEvent({
        level: "INFO",
        actorType: "TENANT_ADMIN",
        tenantId: tenant.slug,
        eventType: "LOGIN_SUCCESS",
        message: "Tenant login success"
    });

    // 4. Create Session
    const session = await getSession();
    session.tenantSlug = tenant.slug;
    session.isLoggedIn = true;
    await session.save();

    redirect(`/${slug}/admin/dashboard`);
}
