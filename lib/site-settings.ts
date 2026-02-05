import { db } from "@/lib/db";
import fs from "fs/promises";
import path from "path";

export interface SiteSettings {
    serpTitle: string;
    serpDescription: string;
    seoKeywords: string[];
    faviconUrl?: string;
    socialImageUrl?: string;
    updatedAt?: string;
}

const SETTINGS_FILE = path.join(process.cwd(), "public", "site-settings.json");

const DEFAULT_SETTINGS: SiteSettings = {
    serpTitle: "MTB Reserve - Bike Rental Platform",
    serpDescription: "Book mountain bikes and e-bikes from local rental shops. Easy online reservations.",
    seoKeywords: ["bike rental", "mountain bike", "e-bike", "booking"],
};

export async function getSiteSettings(): Promise<SiteSettings> {
    try {
        const data = await fs.readFile(SETTINGS_FILE, "utf-8");
        return { ...DEFAULT_SETTINGS, ...JSON.parse(data) };
    } catch {
        return DEFAULT_SETTINGS;
    }
}

export async function saveSiteSettings(settings: Partial<SiteSettings>): Promise<void> {
    const current = await getSiteSettings();
    const updated = {
        ...current,
        ...settings,
        updatedAt: new Date().toISOString(),
    };

    await fs.writeFile(SETTINGS_FILE, JSON.stringify(updated, null, 2), "utf-8");
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
