"use server";

import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { revalidatePath } from "next/cache";

async function ensureSuperAdmin() {
    const session = await getSession();
    if (!session.isLoggedIn || !session.isSuperAdmin) {
        throw new Error("Unauthorized");
    }
}

export async function deleteRequestAction(id: string) {
    try {
        await ensureSuperAdmin();
        await (db as any).signupRequest.delete({ where: { id } });
        revalidatePath("/admin/inbox");
        return { success: true };
    } catch (error) {
        return { success: false, error: "Failed to delete request" };
    }
}

export async function updateRequestStatusAction(id: string, status: string) {
    try {
        await ensureSuperAdmin();
        await (db as any).signupRequest.update({
            where: { id },
            data: { status }
        });
        revalidatePath("/admin/inbox");
        return { success: true };
    } catch (error) {
        return { success: false, error: "Failed to update status" };
    }
}
