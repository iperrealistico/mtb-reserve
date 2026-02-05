"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { ensureAuthenticated } from "@/lib/auth";

export async function cancelBookingAction(formData: FormData) {
    const bookingId = formData.get("bookingId") as string;
    const slug = formData.get("slug") as string;

    await ensureAuthenticated(slug);

    if (!bookingId || !slug) return;

    await db.booking.update({
        where: { id: bookingId },
        data: { status: "CANCELLED" }
    });

    revalidatePath(`/${slug}/admin/dashboard`);
    revalidatePath(`/${slug}/admin/calendar`);
    revalidatePath(`/${slug}`);
}

export async function updateBookingStatusAction(bookingId: string, slug: string, status: string) {
    await ensureAuthenticated(slug);

    await db.booking.update({
        where: { id: bookingId },
        data: { status: status as any }
    });

    revalidatePath(`/${slug}/admin/dashboard`);
}

export async function markAsPaidAction(bookingId: string, slug: string, amount: number) {
    await ensureAuthenticated(slug);

    await db.booking.update({
        where: { id: bookingId },
        data: {
            status: "PAID",
            paidAmount: amount
        }
    });

    revalidatePath(`/${slug}/admin/dashboard`);
}
