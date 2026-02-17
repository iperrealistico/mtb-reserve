"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { ensureAuthenticated } from "@/lib/auth";

export async function cancelBookingAction(formData: FormData) {
    const bookingId = formData.get("bookingId") as string;
    const slug = formData.get("slug") as string;

    await ensureAuthenticated(slug);

    if (!bookingId || !slug) return;
    const notifyUser = formData.get("notifyUser") === "true";

    const booking = await db.booking.update({
        where: { id: bookingId },
        data: { status: "CANCELLED" }
    });

    if (notifyUser && booking.customerEmail) {
        const { sendBookingStatusChangeEmail } = await import("@/lib/email");
        await sendBookingStatusChangeEmail(booking, "CANCELLED");
    }

    revalidatePath(`/${slug}/admin/dashboard`);
    revalidatePath(`/${slug}/admin/calendar`);
    revalidatePath(`/${slug}`);
}

export async function updateBookingStatusAction(bookingId: string, slug: string, status: string, notifyUser: boolean = false) {
    await ensureAuthenticated(slug);

    const booking = await db.booking.update({
        where: { id: bookingId },
        data: { status: status as any }
    });

    if (notifyUser && booking.customerEmail) {
        const { sendBookingStatusChangeEmail } = await import("@/lib/email");
        await sendBookingStatusChangeEmail(booking, status);
    }

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
