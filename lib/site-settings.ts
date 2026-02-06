import { db } from "@/lib/db";

export interface SiteSettings {
    serpTitle: string;
    serpDescription: string;
    seoKeywords: string[];
    faviconUrl?: string;
    socialImageUrl?: string;
    // Email config removed from here as per plan, now in templates
}

const DEFAULT_SETTINGS: SiteSettings = {
    serpTitle: "MTB Reserve - Bike Rental Platform",
    serpDescription: "Book mountain bikes and e-bikes from local rental shops. Easy online reservations.",
    seoKeywords: ["bike rental", "mountain bike", "e-bike", "booking"],
};

export async function getSiteSettings(): Promise<SiteSettings> {
    try {
        const settings = await db.systemSettings.findUnique({
            where: { id: "settings" }
        });

        if (!settings) return DEFAULT_SETTINGS;

        return {
            serpTitle: settings.serpTitle,
            serpDescription: settings.serpDescription,
            seoKeywords: settings.seoKeywords,
            faviconUrl: settings.faviconUrl || undefined,
            socialImageUrl: settings.socialImageUrl || undefined,
        };
    } catch (e) {
        console.error("Failed to fetch system settings:", e);
        return DEFAULT_SETTINGS;
    }
}

export async function saveSiteSettings(settings: Partial<SiteSettings>): Promise<void> {
    await db.systemSettings.upsert({
        where: { id: "settings" },
        create: {
            serpTitle: settings.serpTitle || DEFAULT_SETTINGS.serpTitle,
            serpDescription: settings.serpDescription || DEFAULT_SETTINGS.serpDescription,
            seoKeywords: settings.seoKeywords || DEFAULT_SETTINGS.seoKeywords,
            faviconUrl: settings.faviconUrl,
            socialImageUrl: settings.socialImageUrl,
        },
        update: {
            serpTitle: settings.serpTitle,
            serpDescription: settings.serpDescription,
            seoKeywords: settings.seoKeywords,
            faviconUrl: settings.faviconUrl,
            socialImageUrl: settings.socialImageUrl,
        }
    });
}


// Generate booking code (8 chars, alphanumeric, no ambiguous chars)
const BOOKING_CODE_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // Excludes 0, O, I, 1

export function generateBookingCode(): string {
    let code = "";
    for (let i = 0; i < 8; i++) {
        code += BOOKING_CODE_CHARS.charAt(Math.floor(Math.random() * BOOKING_CODE_CHARS.length));
    }
    return code;
}

export async function generateUniqueBookingCode(): Promise<string> {
    let code = generateBookingCode();
    let attempts = 0;

    while (attempts < 10) {
        const existing = await db.booking.findFirst({
            where: { bookingCode: code }
        });

        if (!existing) {
            return code;
        }

        code = generateBookingCode();
        attempts++;
    }

    // Fallback: add timestamp suffix
    return code + Date.now().toString(36).slice(-2).toUpperCase();
}
