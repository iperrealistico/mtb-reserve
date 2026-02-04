"use server";

import { db } from "@/lib/db";
import { getTenantBySlug, TenantSettings, DEFAULT_SLOTS } from "@/lib/tenants";
import { revalidatePath } from "next/cache";

export async function updateTenantSettingsAction(slug: string, formData: FormData) {
    const contactEmail = formData.get("contactEmail") as string;
    const contactPhone = formData.get("contactPhone") as string;

    const slotsStr = formData.get("slots") as string;
    const fullDayEnabled = formData.get("fullDayEnabled") === "on";
    const minAdvanceHours = Number(formData.get("minAdvanceHours") || 0);
    const blockedDatesStr = formData.get("blockedDates") as string;

    // Parse blocked dates from comma separated string
    const blockedDates = blockedDatesStr
        ? blockedDatesStr.split(",").map(d => d.trim()).filter(d => d.match(/^\d{4}-\d{2}-\d{2}$/))
        : [];

    if (!slotsStr) return { error: "Invalid slots data" };

    let slots = DEFAULT_SLOTS;
    try {
        slots = JSON.parse(slotsStr);
    } catch (e) {
        return { error: "Invalid slots data" };
    }

    const settings: TenantSettings = {
        slots,
        fullDayEnabled,
        minAdvanceHours,
        blockedDates
    };

    try {
        await db.tenant.update({
            where: { slug },
            data: {
                contactEmail,
                contactPhone,
                settings: settings as any // Prisma JSON
            }
        });

        try {
            revalidatePath(`/${slug}/admin/settings`);
        } catch (e) {
            // Ignored for script testing or if outside request context
        }

        return { success: true };
    } catch (error: any) {
        return { error: error.message || "Update failed" };
    }
}
