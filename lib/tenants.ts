import { db } from "@/lib/db";
import { cache } from "react";

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

// Default Slots if none configured
export const DEFAULT_SLOTS: TenantSlot[] = [
    { id: "morning", label: "Morning (09:00 - 13:00)", start: "09:00", end: "13:00" },
    { id: "afternoon", label: "Afternoon (14:00 - 18:00)", start: "14:00", end: "18:00" },
];

export const getTenantBySlug = cache(async (slug: string) => {
    return db.tenant.findUnique({
        where: { slug },
        include: { bikeTypes: true },
    });
});

export function getTenantSettings(tenant: { settings: unknown }): TenantSettings {
    if (!tenant.settings || typeof tenant.settings !== 'object') {
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
            label: `Full Day (${minStart} - ${maxEnd})`,
            start: minStart,
            end: maxEnd
        });
    }

    return slots;
}
