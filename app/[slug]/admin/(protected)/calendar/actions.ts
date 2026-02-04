"use server";

import { db } from "@/lib/db";
import { getTenantBySlug } from "@/lib/tenants";
import { createZonedDate } from "@/lib/time";
import { ensureAuthenticated } from "@/lib/auth";

export async function getDailyBookingsAction(slug: string, dateString: string) {
    await ensureAuthenticated(slug);
    // dateString implicitly from URL, e.g. "2024-06-01" or whatever Format day picker uses
    // If empty, use today.

    const tenant = await getTenantBySlug(slug);
    if (!tenant) return { error: "Tenant not found" };

    const timezone = tenant.timezone || "Europe/Rome";

    // Parse input date or default to 'now' in tenant timezone?
    // Be careful: new Date() is server time.
    // Ideally we want "Today in Rome".
    // For MVP simplicity, if dateString is missing, we might rely on Client to pass today's date string, 
    // OR default to UTC today.

    // Let's assume dateString is "YYYY-MM-DD".
    let targetDate = new Date(); // Fallback
    if (dateString) {
        targetDate = new Date(dateString); // This is UTC if string is "YYYY-MM-DD" usually, or local.
        // To be safe, date picker usually sends "YYYY-MM-DDT00:00:00.000Z" or just "YYYY-MM-DD".
        // Let's assume "YYYY-MM-DD".
    }

    // We want the RANGE for this "Wall Clock Day" in the Tenant Timezone.
    // 00:00 Rome -> 23:59:59 Rome

    // Let's rely on createZonedDate logic which assumes baseDate is a JS Date object.

    const startTime = createZonedDate(targetDate, "00:00", timezone);
    const endTime = createZonedDate(targetDate, "23:59", timezone);

    const bookings = await db.booking.findMany({
        where: {
            tenantSlug: slug,
            startTime: {
                gte: startTime,
                lte: endTime
            }
        },
        include: {
            bikeType: true
        },
        orderBy: {
            startTime: 'asc'
        }
    });

    return { bookings, timezone };
}
