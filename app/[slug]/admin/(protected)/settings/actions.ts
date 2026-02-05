"use server";

import { db } from "@/lib/db";
import { TenantSettings, DEFAULT_SLOTS, BlockedDateRange } from "@/lib/tenants";
import { revalidatePath } from "next/cache";
import { ensureAuthenticated } from "@/lib/auth";

export async function updateTenantSettingsAction(slug: string, formData: FormData) {
    await ensureAuthenticated(slug);

    const contactEmail = formData.get("contactEmail") as string;
    const contactPhone = formData.get("contactPhone") as string;

    const slotsStr = formData.get("slots") as string;
    const fullDayEnabled = formData.get("fullDayEnabled") === "on";

    // Advance Notice (in days)
    const minAdvanceDays = Number(formData.get("minAdvanceDays") || 0);
    const maxAdvanceDays = Number(formData.get("maxAdvanceDays") || 30);

    // Legacy fields for backward compat
    const minAdvanceHours = Number(formData.get("minAdvanceHours") || 0);

    // Parse new blocked date ranges
    const blockedDateRangesStr = formData.get("blockedDateRanges") as string;
    let blockedDateRanges: BlockedDateRange[] = [];
    if (blockedDateRangesStr) {
        try {
            blockedDateRanges = JSON.parse(blockedDateRangesStr);
        } catch {
            // Ignore parse errors, keep empty array
        }
    }

    // Content Customization
    const bookingTitle = formData.get("bookingTitle") as string;
    const bookingSubtitle = formData.get("bookingSubtitle") as string;
    const infoBox = formData.get("infoBox") as string;
    const emailSubjectConfirmation = formData.get("emailSubjectConfirmation") as string;
    const emailSubjectRecap = formData.get("emailSubjectRecap") as string;

    // Pickup Location
    const pickupLocationUrl = formData.get("pickupLocationUrl") as string;

    if (!slotsStr) return { error: "Invalid slots data" };

    let slots = DEFAULT_SLOTS;
    try {
        slots = JSON.parse(slotsStr);
    } catch {
        return { error: "Invalid slots data" };
    }

    // Get existing settings to merge
    const existingTenant = await db.tenant.findUnique({ where: { slug } });
    const existingSettings = (existingTenant?.settings as TenantSettings) || {};

    const settings: TenantSettings = {
        ...existingSettings,
        slots,
        fullDayEnabled,
        minAdvanceHours,
        maxAdvanceDays,
        blockedDateRanges,
        pickupLocationUrl: pickupLocationUrl || undefined,
        content: {
            ...existingSettings.content,
            bookingTitle: bookingTitle || undefined,
            bookingSubtitle: bookingSubtitle || undefined,
            infoBox: infoBox || undefined,
            emailSubjectConfirmation: emailSubjectConfirmation || undefined,
            emailSubjectRecap: emailSubjectRecap || undefined,
        },
    };

    try {
        await db.tenant.update({
            where: { slug },
            data: {
                contactEmail,
                contactPhone,
                settings: settings as object // Prisma JSON
            }
        });

        try {
            revalidatePath(`/${slug}/admin/settings`);
            revalidatePath(`/${slug}`);
        } catch {
            // Ignored for script testing or if outside request context
        }

        return { success: true };
    } catch (error: unknown) {
        return { error: (error as Error).message || "Update failed" };
    }
}
