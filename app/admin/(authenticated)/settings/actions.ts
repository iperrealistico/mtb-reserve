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
