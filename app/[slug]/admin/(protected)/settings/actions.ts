"use server";

import { db } from "@/lib/db";
import { getTenantBySlug, TenantSettings, DEFAULT_SLOTS } from "@/lib/tenants";
import { revalidatePath } from "next/cache";

export async function updateTenantSettingsAction(slug: string, formData: FormData) {
    const contactEmail = formData.get("contactEmail") as string;
    const contactPhone = formData.get("contactPhone") as string;

    // Parse slots from JSON string (client will stringify)
    const slotsJson = formData.get("slots") as string;
    const fullDayEnabled = formData.get("fullDayEnabled") === "on";

    let slots = DEFAULT_SLOTS;
    try {
        if (slotsJson) {
            slots = JSON.parse(slotsJson);
        }
    } catch (e) {
        return { error: "Invalid slots data" };
    }

    const settings: TenantSettings = {
        slots,
        fullDayEnabled
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
