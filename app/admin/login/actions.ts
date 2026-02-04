"use server";

import { db } from "@/lib/db";
import { getSession, verifyPassword } from "@/lib/auth";
import { redirect } from "next/navigation";
import { rateLimit } from "@/lib/rate-limit";
import { headers } from "next/headers";
import { logEvent } from "@/lib/events";

export async function superAdminLoginAction(prevState: any, formData: FormData) {
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    if (!email || !password) {
        return { error: "Email and password are required" };
    }

    // Rate Limit by IP
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

    const admin = await db.superAdmin.findUnique({
        where: { email },
    });

    if (!admin) {
        // Generic error
        await logEvent({
            level: "WARN",
            actorType: "GUEST",
            eventType: "LOGIN_FAILURE",
            message: "Super admin login failed: user not found",
            metadata: { email }
        });
        return { error: "Invalid credentials" };
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
