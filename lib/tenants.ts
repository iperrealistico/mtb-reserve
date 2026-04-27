import { db } from "@/lib/db";
import { cache } from "react";
import type { Tenant, BikeType } from "@prisma/client";

// Cached to prevent duplicate requests in the same render cycle
// Typed Settings
export interface TenantSlot {
    id: string;
    label: string;
    start: string; // "09:00"
    end: string;   // "13:00"
}

export interface BlockedDateRange {
    id: string;
    start: string; // "YYYY-MM-DD"
    end: string;   // "YYYY-MM-DD"
    recurringYearly: boolean;
}

export interface TenantSettings {
    slots?: TenantSlot[];
    fullDayEnabled?: boolean;

    // Blocked Dates
    blockedDates?: string[]; // Legacy: ISO Date Strings "YYYY-MM-DD" (kept for backward compat)
    blockedDateRanges?: BlockedDateRange[]; // New: date ranges with recurring option

    // Advance Notice
    minAdvanceHours?: number; // Legacy: hours (kept for backward compat)
    minAdvanceDays?: number;  // Days before booking must be made (0 = same day OK)
    maxAdvanceDays?: number;  // Days in future that bookings are allowed (default 30)

    // Content Customization
    content?: {
        bookingTitle?: string;
        bookingSubtitle?: string;
        emailSubjectConfirmation?: string;
        emailSubjectRecap?: string;
        infoBox?: string; // Markdown or text
    };

    // Pickup Location
    pickupLocationUrl?: string; // Google Maps URL
}

export type TenantWithBikeTypes = Tenant & { bikeTypes: BikeType[] };

// Default Slots if none configured
export const DEFAULT_SLOTS: TenantSlot[] = [
    { id: "morning", label: "Morning", start: "09:00", end: "13:00" },
    { id: "evening", label: "Evening", start: "14:00", end: "18:00" },
];

export const getTenantBySlug = cache(async (slug: string) => {
    return db.tenant.findFirst({
        where: {
            OR: [
                { slug },
                { publicSlug: slug },
            ],
        },
        include: { bikeTypes: true },
    });
});

export const getPublishedTenantBySlug = cache(async (slug: string) => {
    return db.tenant.findFirst({
        where: {
            isPublished: true,
            OR: [
                { publicSlug: slug },
                {
                    AND: [
                        { publicSlug: null },
                        { slug },
                    ],
                },
            ],
        },
        include: { bikeTypes: true },
    });
});

export async function getTenantInternalSlug(slugOrPublicSlug: string) {
    const tenant = await db.tenant.findFirst({
        where: {
            OR: [
                { slug: slugOrPublicSlug },
                { publicSlug: slugOrPublicSlug },
            ],
        },
        select: { slug: true },
    });

    return tenant?.slug ?? null;
}

export function getTenantRouteSlug(tenant: Pick<Tenant, "slug" | "publicSlug">) {
    return tenant.publicSlug || tenant.slug;
}

export function isTenantPubliclyAccessible(tenant: Pick<Tenant, "isPublished" | "publicSlug" | "slug">) {
    if (!tenant.isPublished) {
        return false;
    }

    return Boolean(tenant.publicSlug || tenant.slug);
}

export function slugifyTenantName(value: string) {
    const normalized = value
        .normalize("NFKD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")
        .replace(/-{2,}/g, "-");

    return normalized || "organizer";
}

export async function generateUniqueTenantPublicSlug(name: string, excludeSlug?: string) {
    const base = slugifyTenantName(name);
    let candidate = base;
    let suffix = 2;

    while (true) {
        const existing = await db.tenant.findFirst({
            where: {
                publicSlug: candidate,
                ...(excludeSlug ? { NOT: { slug: excludeSlug } } : {}),
            },
            select: { slug: true },
        });

        if (!existing) {
            return candidate;
        }

        candidate = `${base}-${suffix}`;
        suffix += 1;
    }
}

export function getTenantSettings(tenant: { settings: unknown }): TenantSettings {
    if (!tenant.settings || typeof tenant.settings !== "object") {
        return {
            slots: DEFAULT_SLOTS,
            fullDayEnabled: true,
            minAdvanceDays: 0,
            maxAdvanceDays: 30,
        };
    }

    const s = tenant.settings as TenantSettings;
    return {
        slots: s.slots || DEFAULT_SLOTS,
        fullDayEnabled: s.fullDayEnabled ?? true,
        blockedDates: s.blockedDates || [],
        blockedDateRanges: s.blockedDateRanges || [],
        minAdvanceHours: s.minAdvanceHours || 0,
        minAdvanceDays: s.minAdvanceDays ?? 0,
        maxAdvanceDays: s.maxAdvanceDays ?? 30,
        content: s.content || {},
        pickupLocationUrl: s.pickupLocationUrl || "",
    };
}

export function getComputedSlots(tenant: { settings: unknown }): TenantSlot[] {
    const settings = getTenantSettings(tenant);
    const slots = [...(settings.slots || [])];

    if (settings.fullDayEnabled && slots.length > 0) {
        let minStart = slots[0].start;
        let maxEnd = slots[0].end;

        for (const s of slots) {
            if (s.start < minStart) minStart = s.start;
            if (s.end > maxEnd) maxEnd = s.end;
        }

        slots.push({
            id: "full-day",
            label: `All Day (${minStart} - ${maxEnd})`,
            start: minStart,
            end: maxEnd,
        });
    }

    return slots;
}
