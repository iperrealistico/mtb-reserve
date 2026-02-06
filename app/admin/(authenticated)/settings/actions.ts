"use server";

import { getSession } from "@/lib/auth";
import { getSiteSettings, saveSiteSettings } from "@/lib/site-settings";
import { revalidatePath } from "next/cache";
import { put } from "@vercel/blob";
import sharp from "sharp";

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
        const adminNotificationEmail = formData.get("adminNotificationEmail") as string;

        const seoKeywords = seoKeywordsRaw
            .split(",")
            .map(k => k.trim())
            .filter(k => k.length > 0);

        await saveSiteSettings({
            serpTitle: serpTitle || undefined,
            serpDescription: serpDescription || undefined,
            seoKeywords: seoKeywords.length > 0 ? seoKeywords : undefined,
            adminNotificationEmail: adminNotificationEmail || undefined,
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

        const buffer = Buffer.from(await file.arrayBuffer());

        // For SVG files, we need to rasterize to a high-res PNG first
        // Sharp handles SVG but requires explicit rasterization for resizing
        let sourceBuffer: Buffer;

        if (file.type === "image/svg+xml") {
            // Rasterize SVG to high-resolution PNG (512x512) as source
            sourceBuffer = await sharp(buffer, { density: 300 })
                .resize(512, 512, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
                .png()
                .toBuffer();
        } else {
            sourceBuffer = buffer;
        }

        const timestamp = Date.now();

        // Generate all required favicon sizes
        const faviconSizes = [
            { name: `favicon-16-${timestamp}.png`, size: 16 },
            { name: `favicon-32-${timestamp}.png`, size: 32 },
            { name: `favicon-192-${timestamp}.png`, size: 192 },
            { name: `apple-touch-icon-${timestamp}.png`, size: 180 },
        ];

        const urls: { [key: string]: string } = {};

        for (const { name, size } of faviconSizes) {
            const resizedBuffer = await sharp(sourceBuffer)
                .resize(size, size, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
                .png()
                .toBuffer();

            const blob = await put(name, resizedBuffer, {
                access: 'public',
                contentType: 'image/png'
            });

            // Map size to field name
            if (size === 16) urls.favicon16Url = blob.url;
            else if (size === 32) urls.favicon32Url = blob.url;
            else if (size === 192) urls.faviconUrl = blob.url;
            else if (size === 180) urls.faviconAppleUrl = blob.url;
        }

        // Update settings with all favicon URLs
        await saveSiteSettings({
            faviconUrl: urls.faviconUrl,
            favicon16Url: urls.favicon16Url,
            favicon32Url: urls.favicon32Url,
            faviconAppleUrl: urls.faviconAppleUrl,
        });

        revalidatePath("/");
        revalidatePath("/admin/settings");

        return { success: true, error: "", url: urls.faviconUrl };
    } catch (error: unknown) {
        console.error("Favicon upload error:", error);
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

        // Resize and convert using sharp
        const buffer = Buffer.from(await file.arrayBuffer());
        const resizedBuffer = await sharp(buffer)
            .resize(1200, 630, { fit: 'cover' })
            .toFormat('jpeg', { quality: 80 })
            .toBuffer();

        const filename = `og-image-${Date.now()}.jpg`;

        // Upload to Vercel Blob
        const blob = await put(filename, resizedBuffer, {
            access: 'public',
            contentType: 'image/jpeg'
        });

        // Update settings
        await saveSiteSettings({
            socialImageUrl: blob.url,
        });

        revalidatePath("/");
        revalidatePath("/admin/settings");

        return { success: true, error: "", url: blob.url };
    } catch (error: unknown) {
        return { success: false, error: (error as Error).message || "Failed to upload image" };
    }
}
