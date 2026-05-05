"use server";

import { db } from "@/lib/db";
import { generateSecureItalianPassword, hashPassword } from "@/lib/auth";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { sendEmail, sendTenantOnboardingEmail } from "@/lib/email";

// --- Types ---
interface ActionState {
    success: boolean;
    error: string;
    newPassword?: string;
}

type TenantContentSettings = Record<string, unknown> & {
    content?: Record<string, unknown>;
};

function getEmailErrorMessage(error: unknown) {
    if (error instanceof Error) {
        return error.message;
    }

    return "Unable to send onboarding email";
}

// --- Create ---
export async function createTenantAction(_prevState: unknown, formData: FormData): Promise<ActionState> {
    const name = formData.get("name") as string;
    const slug = formData.get("slug") as string;
    const contactEmail = formData.get("contactEmail") as string;
    const registrationEmail = formData.get("registrationEmail") as string;

    if (!name || !slug || !contactEmail || !registrationEmail) {
        return { success: false, error: "All fields are required" };
    }

    // Check slug uniqueness
    const existing = await db.tenant.findFirst({
        where: {
            OR: [
                { slug },
                { publicSlug: slug },
            ],
        },
        select: { slug: true },
    });
    if (existing) {
        return { success: false, error: "Slug is already taken." };
    }

    const password = generateSecureItalianPassword();
    const passwordHash = await hashPassword(password);

    try {
        await db.tenant.create({
            data: {
                slug,
                publicSlug: slug,
                isPublished: false,
                publishedAt: null,
                name,
                contactEmail,
                registrationEmail,
                adminPasswordHash: passwordHash,
                timezone: "Europe/Rome",
                settings: {},
            }
        });

        // Email the password to the tenant
        const onboardingResult = await sendTenantOnboardingEmail({
            name,
            registrationEmail,
            password,
            routeSlug: slug,
        });

        if (onboardingResult.error) {
            return {
                success: false,
                error: `Tenant created, but onboarding email failed: ${getEmailErrorMessage(onboardingResult.error)}`,
            };
        }
    } catch (e) {
        return { success: false, error: "Failed to create tenant. " + e };
    }

    redirect(`/admin/tenants/${slug}`);
}

// --- Update Content ---
export async function updateTenantContentAction(_prevState: unknown, formData: FormData): Promise<ActionState> {
    const slug = formData.get("slug") as string;
    const content = {
        bookingTitle: formData.get("bookingTitle") as string,
        bookingSubtitle: formData.get("bookingSubtitle") as string,
        infoBox: formData.get("infoBox") as string,
        emailSubjectConfirmation: formData.get("emailSubjectConfirmation") as string,
    };

    const tenant = await db.tenant.findUnique({ where: { slug } });
    if (!tenant) return { success: false, error: "Tenant not found" };

    const currentSettings = (tenant.settings as TenantContentSettings | null) || {};
    const newSettings = {
        ...currentSettings,
        content: {
            ...currentSettings.content,
            ...content
        }
    };

    await db.tenant.update({
        where: { slug },
        data: { settings: newSettings }
    });

    revalidatePath(`/admin/tenants/${slug}`);
    return { success: true, error: "" };
}

// --- Send Email ---
export async function sendTenantEmailAction(_prevState: unknown, formData: FormData): Promise<ActionState> {
    const slug = formData.get("slug") as string;
    const to = formData.get("to") as string;
    const subject = formData.get("subject") as string;
    const body = formData.get("body") as string;

    if (!to || !subject || !body) return { success: false, error: "Missing fields" };

    const result = await sendEmail({
        to,
        subject,
        html: body,
        category: 'manual_admin',
        entityId: slug
    });

    if (result.error) {
        const errorMsg = result.error instanceof Error ? result.error.message : "Check Resend dashboard";
        return { success: false, error: "Email failed: " + errorMsg };
    }

    return { success: true, error: "" };
}

// --- Update Details ---
export async function updateTenantDetailsAction(_prevState: unknown, formData: FormData): Promise<ActionState> {
    const slug = formData.get("slug") as string;
    const name = formData.get("name") as string;
    const registrationEmail = formData.get("registrationEmail") as string;

    if (!name || !registrationEmail) return { success: false, error: "Fields required" };

    await db.tenant.update({
        where: { slug },
        data: { name, registrationEmail }
    });

    revalidatePath(`/admin/tenants/${slug}`);
    return { success: true, error: "" };
}

// --- Reset Password (Admin Force) ---
// --- Reset Password (Admin Force) ---
export async function resetTenantPasswordAdminAction(_prevState: unknown, formData: FormData): Promise<ActionState> {
    const slug = formData.get("slug") as string;

    const tenant = await db.tenant.findUnique({
        where: { slug },
        select: {
            registrationEmail: true,
            name: true,
        },
    });
    if (!tenant) return { success: false, error: "Tenant not found" };

    const newPassword = generateSecureItalianPassword();
    const newHash = await hashPassword(newPassword);

    await db.tenant.update({
        where: { slug },
        data: { adminPasswordHash: newHash }
    });

    // Email the new password
    await sendEmail({
        to: tenant.registrationEmail,
        subject: `Security Alert: Admin Password Reset`,
        category: 'password_reset',
        entityId: slug,
        html: `
            <h1>Password Reset</h1>
            <p>Your admin password for <strong>${tenant.name}</strong> has been reset by a system administrator.</p>
            <p><strong>New Password:</strong> ${newPassword}</p>
            <p>If you did not request this, please contact support immediately.</p>
        `
    });

    revalidatePath(`/admin/tenants/${slug}`);
    // Do NOT return the password to the client
    return { success: true, error: "" };
}

// --- Delete ---
export async function deleteTenantAction(_prevState: unknown, formData: FormData): Promise<ActionState> {
    const slug = formData.get("slug") as string;
    await db.tenant.delete({ where: { slug } });
    redirect("/admin");
}
