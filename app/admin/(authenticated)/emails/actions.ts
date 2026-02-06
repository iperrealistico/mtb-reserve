"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function saveEmailTemplateAction(id: string, subject: string, html: string, senderName?: string, senderEmail?: string) {
    try {
        await (db as any).emailTemplate.upsert({
            where: { id },
            update: { subject, html, senderName, senderEmail },
            create: { id, subject, html, senderName, senderEmail }
        });
        revalidatePath("/admin/emails");
        return { success: true };
    } catch (error: any) {
        return { error: error.message || "Failed to save template" };
    }
}

export async function getEmailTemplatesAction() {
    try {
        return await (db as any).emailTemplate.findMany();
    } catch (error) {
        return [];
    }
}
