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

export interface TenantSettings {
    slots?: TenantSlot[];
    fullDayEnabled?: boolean;
    // Add other settings here safely
}

// Default Slots if none configured
export const DEFAULT_SLOTS: TenantSlot[] = [
    { id: "morning", label: "Morning (09:00 - 13:00)", start: "09:00", end: "13:00" },
    { id: "afternoon", label: "Afternoon (14:00 - 18:00)", start: "14:00", end: "18:00" },
];

export const getTenantBySlug = cache(async (slug: string) => {
    return db.tenant.findUnique({
        where: { slug },
        // include: { bikeTypes: true }, // optimization: specific calls might need this, or we lazily fetch. 
        // Original had it, so let's keep it to avoid breaking other pages?
        // Actually, if I look at page.tsx it just displays name. 
        // But `actions.ts` calls it.
        // Let's keep it safe.
    });
});

export function getTenantSettings(tenant: { settings: any }): TenantSettings {
    if (!tenant.settings || typeof tenant.settings !== 'object') {
        return { slots: DEFAULT_SLOTS, fullDayEnabled: true };
    }
    const s = tenant.settings as TenantSettings;
    return {
        slots: s.slots || DEFAULT_SLOTS,
        fullDayEnabled: s.fullDayEnabled ?? true,
    };
}
