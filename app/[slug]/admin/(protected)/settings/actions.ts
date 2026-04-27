"use server";

import { db } from "@/lib/db";
import {
    TenantSettings,
    DEFAULT_SLOTS,
    BlockedDateRange,
    getTenantBySlug,
    getTenantRouteSlug,
    slugifyTenantName,
} from "@/lib/tenants";
import { revalidatePath } from "next/cache";
import { ensureAuthenticated, verifyPassword, hashPassword } from "@/lib/auth";
import { logEvent } from "@/lib/events";

export async function updateTenantSettingsAction(slug: string, formData: FormData) {
    await ensureAuthenticated(slug);
    const tenant = await getTenantBySlug(slug);

    if (!tenant) {
        return { error: "Tenant not found" };
    }

    const previousRouteSlug = getTenantRouteSlug(tenant);

    const contactEmail = formData.get("contactEmail") as string;
    const contactPhone = formData.get("contactPhone") as string;
    const requestedPublicSlug = formData.get("publicSlug") as string;

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
    const existingTenant = await db.tenant.findUnique({ where: { slug: tenant.slug } });
    const existingSettings = (existingTenant?.settings as TenantSettings) || {};

    const normalizedPublicSlug = slugifyTenantName(requestedPublicSlug || tenant.publicSlug || tenant.slug);

    if (tenant.isPublished && normalizedPublicSlug !== (tenant.publicSlug || tenant.slug)) {
        return { error: "Shop URL can no longer be changed after publication." };
    }

    const conflictingTenant = await db.tenant.findFirst({
        where: {
            publicSlug: normalizedPublicSlug,
            NOT: { slug: tenant.slug },
        },
        select: { slug: true },
    });

    if (conflictingTenant) {
        return { error: "That shop URL is already taken." };
    }

    const settings: TenantSettings = {
        ...existingSettings,
        slots,
        fullDayEnabled,
        minAdvanceHours,
        minAdvanceDays,
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
        const updatedTenant = await db.tenant.update({
            where: { slug: tenant.slug },
            data: {
                contactEmail,
                contactPhone,
                publicSlug: normalizedPublicSlug,
                settings: settings as object // Prisma JSON
            }
        });

        const routeSlug = getTenantRouteSlug(updatedTenant);

        try {
            revalidatePath(`/${previousRouteSlug}/admin/settings`);
            revalidatePath(`/${routeSlug}/admin/settings`);
            revalidatePath(`/${previousRouteSlug}/admin/dashboard`);
            revalidatePath(`/${routeSlug}/admin/dashboard`);
            revalidatePath(`/${previousRouteSlug}`);
            revalidatePath(`/${routeSlug}`);
        } catch {
            // Ignored for script testing or if outside request context
        }

        return { success: true, routeSlug };
    } catch (error: unknown) {
        return { error: (error as Error).message || "Update failed" };
    }
}

export async function publishTenantProfileAction(slug: string) {
    await ensureAuthenticated(slug);
    const tenant = await getTenantBySlug(slug);

    if (!tenant) {
        return { error: "Tenant not found" };
    }

    const previousRouteSlug = getTenantRouteSlug(tenant);

    if (tenant.isPublished) {
        return { success: true, routeSlug: previousRouteSlug };
    }

    const publicSlug = tenant.publicSlug || tenant.slug;
    if (!publicSlug) {
        return { error: "Set your shop URL before publishing." };
    }

    const updatedTenant = await db.tenant.update({
        where: { slug: tenant.slug },
        data: {
            publicSlug,
            isPublished: true,
            publishedAt: tenant.publishedAt || new Date(),
        },
    });

    await logEvent({
        level: "INFO",
        tenantId: tenant.slug,
        actorType: "TENANT_ADMIN",
        actorId: tenant.slug,
        eventType: "TENANT_PROFILE_PUBLISHED",
        message: "Tenant profile published from settings",
    });

    const routeSlug = getTenantRouteSlug(updatedTenant);

    try {
        revalidatePath(`/${previousRouteSlug}/admin/settings`);
        revalidatePath(`/${routeSlug}/admin/settings`);
        revalidatePath(`/${previousRouteSlug}`);
        revalidatePath(`/${routeSlug}`);
    } catch {
        // Ignored for script testing or if outside request context
    }

    return { success: true, routeSlug };
}

export async function changePasswordAction(prevState: any, formData: FormData) {
    const slug = formData.get("slug") as string;
    const currentPassword = formData.get("currentPassword") as string;
    const newPassword = formData.get("newPassword") as string;

    const session = await ensureAuthenticated(slug);

    if (!currentPassword || !newPassword) {
        return { success: false, error: "Passwords are required" };
    }

    // Server-side validation (matching client)
    const isValid = newPassword.length >= 8 &&
        newPassword.length <= 32 &&
        /[A-Z]/.test(newPassword) &&
        /[0-9]/.test(newPassword) &&
        /[!@#$%^&*(),.?":{}|<>]/.test(newPassword);

    if (!isValid) {
        return { success: false, error: "Password does not meet requirements" };
    }

    const routeTenant = await getTenantBySlug(slug);
    if (!routeTenant) return { success: false, error: "Tenant not found" };

    const tenant = await db.tenant.findUnique({
        where: { slug: routeTenant.slug }
    });

    if (!tenant) return { success: false, error: "Tenant not found" };

    // Verify current
    const isCorrect = await verifyPassword(currentPassword, tenant.adminPasswordHash);
    if (!isCorrect) {
        await logEvent({
            level: "WARN",
            tenantId: routeTenant.slug,
            actorType: "TENANT_ADMIN",
            actorId: routeTenant.slug,
            eventType: "PASSWORD_CHANGE_FAILED",
            message: "Failed password change attempt: Incorrect current password"
        });
        return { success: false, error: "Incorrect current password" };
    }

    // Update
    const newHash = await hashPassword(newPassword);
    await db.tenant.update({
        where: { slug: routeTenant.slug },
        data: {
            adminPasswordHash: newHash,
            tokenVersion: { increment: 1 } // Invalidate other sessions
        }
    });

    // Update current session to match new version
    session.tokenVersion = (tenant.tokenVersion || 0) + 1;
    await session.save();

    await logEvent({
        level: "INFO",
        tenantId: routeTenant.slug,
        actorType: "TENANT_ADMIN",
        actorId: routeTenant.slug,
        eventType: "PASSWORD_CHANGED",
        message: "Tenant password updated successfully"
    });

    return { success: true, error: "" };
}
