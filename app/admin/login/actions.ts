"use server";

import { db } from "@/lib/db";
import { getSession, verifyPassword } from "@/lib/auth";
import { redirect } from "next/navigation";
import { rateLimit } from "@/lib/rate-limit";
import { headers } from "next/headers";
import { logEvent } from "@/lib/events";

export async function superAdminLoginAction(prevState: any, formData: FormData) {
    const password = formData.get("password") as string;

    if (!password) {
        return { error: "Password is required" };
    }

    // Rate Limit by IP (Stricter for password only)
    const headerList = await headers();
    const ip = headerList.get("x-forwarded-for") || "127.0.0.1";

    const limitResult = await rateLimit(`superadmin_login:${ip}`, 5, 900);
    if (!limitResult.success) {
        await logEvent({
            level: "WARN",
            actorType: "GUEST",
            eventType: "RATE_LIMIT_BLOCKED",
            message: "Super admin login rate limited",
            metadata: { ip }
        });
        return { error: "Too many login attempts. Please try again later." };
    }

    // Find the single super admin
    const admin = await db.superAdmin.findFirst();

    if (!admin) {
        // No admin setup? This is critical.
        // Should we create one? No, that's unsafe.
        return { error: "System Configuration Error: No Super Admin found." };
    }

    const isValid = await verifyPassword(password, admin.passwordHash);

    if (!isValid) {
        await logEvent({
            level: "WARN",
            actorType: "SUPER_ADMIN",
            actorId: admin.id,
            eventType: "LOGIN_FAILURE",
            message: "Super admin login failed: invalid password"
        });
        return { error: "Invalid credentials" };
    }

    await logEvent({
        level: "INFO",
        actorType: "SUPER_ADMIN",
        actorId: admin.id,
        eventType: "LOGIN_SUCCESS",
        message: "Super admin login success"
    });

    // Record Attempt (Success)
    // Optional: Log successful login?

    // Session
    const session = await getSession();
    session.isLoggedIn = true;
    session.isSuperAdmin = true;
    session.superAdminId = admin.id;
    // We do NOT set tenantSlug for super admin global session, or maybe we do if they impersonate?
    // For now, clean session.
    session.tenantSlug = undefined;

    await session.save();

    redirect("/admin");
}
