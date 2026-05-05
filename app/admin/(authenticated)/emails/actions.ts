"use server";

import { ensureSuperAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { resendOrganizerAccess } from "@/lib/signup";
import { revalidatePath } from "next/cache";

export async function saveEmailTemplateAction(id: string, subject: string, html: string, senderName?: string, senderEmail?: string) {
    try {
        await db.emailTemplate.upsert({
            where: { id },
            update: { subject, html, senderName, senderEmail },
            create: { id, subject, html, senderName, senderEmail }
        });
        revalidatePath("/admin/emails");
        return { success: true };
    } catch (error: unknown) {
        return { error: error instanceof Error ? error.message : "Failed to save template" };
    }
}

export async function getEmailTemplatesAction() {
    try {
        return await db.emailTemplate.findMany();
    } catch {
        return [];
    }
}

export async function resendOrganizerAccessAction(formData: FormData) {
    await ensureSuperAdmin();

    const signupRequestId = formData.get("signupRequestId") as string;
    if (!signupRequestId) {
        throw new Error("Application reference is required.");
    }

    await resendOrganizerAccess(signupRequestId);
    revalidatePath("/admin/emails");
}
