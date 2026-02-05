"use server";

import { getSession } from "@/lib/auth";
import { getSiteSettings, saveSiteSettings } from "@/lib/site-settings";
import { revalidatePath } from "next/cache";
import fs from "fs/promises";
import path from "path";

async function ensureSuperAdmin() {
    const session = await getSession();
    if (!session.isLoggedIn || !session.isSuperAdmin) {
        throw new Error("Unauthorized");
    }
    return session;
}

import { db } from "@/lib/db";
import { hashPassword, verifyPassword } from "@/lib/auth";
import { logEvent } from "@/lib/events";

export async function changeSuperAdminPasswordAction(_prevState: unknown, formData: FormData) {
    try {
        const session = await ensureSuperAdmin();

        const currentPassword = formData.get("currentPassword") as string;
        const newPassword = formData.get("newPassword") as string;

        if (!currentPassword || !newPassword) {
            return { success: false, error: "Passwords are required" };
        }

        // Validate strength
        const isValid = newPassword.length >= 8 &&
            /[A-Z]/.test(newPassword) &&
            /[0-9]/.test(newPassword);

        if (!isValid) {
            return { success: false, error: "Password must be at least 8 chars, with 1 number and 1 uppercase letter." };
        }

        const admin = await db.superAdmin.findUnique({
            where: { id: session.superAdminId }
        });

        if (!admin) return { success: false, error: "Admin not found" };

        const isCorrect = await verifyPassword(currentPassword, admin.passwordHash);
        if (!isCorrect) {
            await logEvent({
                level: "WARN",
                actorType: "SUPER_ADMIN",
                actorId: admin.id,
                eventType: "PASSWORD_CHANGE_FAILED",
                message: "Super Admin password change failed: incorrect current password"
            });
            return { success: false, error: "Incorrect current password" };
        }

        const newHash = await hashPassword(newPassword);

        // Update DB and Token Version
        await db.superAdmin.update({
            where: { id: admin.id },
            data: {
                passwordHash: newHash,
                tokenVersion: { increment: 1 }
            }
        });

        // Update Session
        session.tokenVersion = (admin.tokenVersion || 0) + 1;
        await session.save();

        await logEvent({
            level: "INFO",
            actorType: "SUPER_ADMIN",
            actorId: admin.id,
            eventType: "PASSWORD_CHANGED",
            message: "Super Admin password updated successfully"
        });

        return { success: true, error: "" };
    } catch (error: unknown) {
        return { success: false, error: (error as Error).message || "Failed to change password" };
    }
}

export async function updateSiteSettingsAction(_prevState: unknown, formData: FormData) {
    try {
        await ensureSuperAdmin();

        const serpTitle = formData.get("serpTitle") as string;
        const serpDescription = formData.get("serpDescription") as string;
        const seoKeywordsRaw = formData.get("seoKeywords") as string;

        const seoKeywords = seoKeywordsRaw
            .split(",")
            .map(k => k.trim())
            .filter(k => k.length > 0);

        await saveSiteSettings({
            serpTitle: serpTitle || undefined,
            serpDescription: serpDescription || undefined,
            seoKeywords: seoKeywords.length > 0 ? seoKeywords : undefined,
        });

        revalidatePath("/");
        revalidatePath("/admin/settings");

        return { success: true, error: "" };
    } catch (error: unknown) {
        return { success: false, error: (error as Error).message || "Failed to update settings" };
    }
}

export async function uploadFaviconAction(_prevState: unknown, formData: FormData) {
    try {
        await ensureSuperAdmin();

        const file = formData.get("favicon") as File;
        if (!file || file.size === 0) {
            return { success: false, error: "No file provided" };
        }

        // Validate file type
        const validTypes = ["image/png", "image/x-icon", "image/svg+xml", "image/jpeg"];
        if (!validTypes.includes(file.type)) {
            return { success: false, error: "Invalid file type. Use PNG, ICO, SVG, or JPEG." };
        }

        // Read file as buffer
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Save to public folder
        const ext = file.type === "image/x-icon" ? "ico" :
            file.type === "image/svg+xml" ? "svg" :
                file.type === "image/png" ? "png" : "jpg";

        const filename = `favicon-uploaded.${ext}`;
        const filepath = path.join(process.cwd(), "public", filename);

        await fs.writeFile(filepath, buffer);

        // Update settings
        await saveSiteSettings({
            faviconUrl: `/${filename}`,
        });

        revalidatePath("/");
        revalidatePath("/admin/settings");

        return { success: true, error: "", url: `/${filename}` };
    } catch (error: unknown) {
        return { success: false, error: (error as Error).message || "Failed to upload favicon" };
    }
}

export async function uploadSocialImageAction(_prevState: unknown, formData: FormData) {
    try {
        await ensureSuperAdmin();

        const file = formData.get("socialImage") as File;
        if (!file || file.size === 0) {
            return { success: false, error: "No file provided" };
        }

        // Validate file type
        const validTypes = ["image/png", "image/jpeg", "image/webp"];
        if (!validTypes.includes(file.type)) {
            return { success: false, error: "Invalid file type. Use PNG, JPEG, or WebP." };
        }

        // Read file as buffer
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Save to public folder
        const ext = file.type === "image/png" ? "png" :
            file.type === "image/webp" ? "webp" : "jpg";

        const filename = `og-image.${ext}`;
        const filepath = path.join(process.cwd(), "public", filename);

        await fs.writeFile(filepath, buffer);

        // Update settings
        await saveSiteSettings({
            socialImageUrl: `/${filename}`,
        });

        revalidatePath("/");
        revalidatePath("/admin/settings");

        return { success: true, error: "", url: `/${filename}` };
    } catch (error: unknown) {
        return { success: false, error: (error as Error).message || "Failed to upload image" };
    }
}
