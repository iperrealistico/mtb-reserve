"use server";

import { ensureSuperAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { sendMailboxReply } from "@/lib/mailbox";
import { resendOrganizerAccess } from "@/lib/signup";
import { revalidatePath } from "next/cache";

function refreshEmailConsole() {
    revalidatePath("/admin/emails");
}

export async function replyToThreadAction(formData: FormData) {
    await ensureSuperAdmin();

    const threadId = formData.get("threadId") as string;
    const body = (formData.get("body") as string)?.trim();

    if (!threadId || !body) {
        throw new Error("Thread and reply body are required.");
    }

    await sendMailboxReply(threadId, body);
    refreshEmailConsole();
}

export async function markThreadReadAction(formData: FormData) {
    await ensureSuperAdmin();

    const threadId = formData.get("threadId") as string;
    if (!threadId) {
        throw new Error("Thread is required.");
    }

    await db.inboxThread.update({
        where: { id: threadId },
        data: {
            unreadCount: 0,
        },
    });

    refreshEmailConsole();
}

export async function toggleThreadStatusAction(formData: FormData) {
    await ensureSuperAdmin();

    const threadId = formData.get("threadId") as string;
    const nextStatus = formData.get("status") as "OPEN" | "CLOSED";

    if (!threadId || !nextStatus) {
        throw new Error("Thread status update is incomplete.");
    }

    await db.inboxThread.update({
        where: { id: threadId },
        data: {
            status: nextStatus,
        },
    });

    refreshEmailConsole();
}

export async function resendOrganizerAccessAction(formData: FormData) {
    await ensureSuperAdmin();

    const signupRequestId = formData.get("signupRequestId") as string;
    if (!signupRequestId) {
        throw new Error("Application reference is required.");
    }

    await resendOrganizerAccess(signupRequestId);
    refreshEmailConsole();
}
