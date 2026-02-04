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
