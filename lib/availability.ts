import { db } from "@/lib/db";
import { createZonedDate } from "@/lib/time";

export interface TimeSlot {
    id: string; // "morning" | "afternoon" | "full-day"
    label: string;
    start: string; // "09:00"
    end: string;   // "13:00"
}

export type AvailabilityResult = {
    [bikeTypeId: string]: number; // Available count
};

export async function getBikeAvailability(
    tenantSlug: string,
    date: Date,
    startTimeStr: string,
    endTimeStr: string,
    timezone: string = "Europe/Rome",
    settings?: { blockedDates?: string[], minAdvanceHours?: number }
): Promise<AvailabilityResult> {

    // 0. Check Blocked Dates & Min Advance
    // Note: We need the date string in YYYY-MM-DD to check blockedDates.
    // Ideally we use the formatted date from the `date` object.
    const dateStr = date.toISOString().split('T')[0];
    if (settings?.blockedDates?.includes(dateStr)) {
        return {}; // Return empty availability if blocked
    }

    // 1. Get all bike types for this tenant
    const bikeTypes = await db.bikeType.findMany({
        where: { tenantSlug },
    });

    // 2. Define the requested interval for the specific date in the specific timezone
    const reqStart = createZonedDate(date, startTimeStr, timezone);
    const reqEnd = createZonedDate(date, endTimeStr, timezone);

    // Check Min Advance
    if (settings?.minAdvanceHours && settings.minAdvanceHours > 0) {
        const now = new Date();
        const minStart = new Date(now.getTime() + settings.minAdvanceHours * 60 * 60 * 1000);
        if (reqStart < minStart) {
            // Too soon
            const empty: AvailabilityResult = {};
            bikeTypes.forEach(b => empty[b.id] = 0);
            return empty;
        }
    }

    // 3. Count Overlapping Bookings for each Bike Type
    // Overlap: (BookingStart < ReqEnd) AND (BookingEnd > ReqStart)
    const availability: AvailabilityResult = {};

    for (const bike of bikeTypes) {
        const result = await db.booking.aggregate({
            _sum: {
                quantity: true,
            },
            where: {
                tenantSlug,
                bikeTypeId: bike.id,
                AND: [
                    { startTime: { lt: reqEnd } },
                    { endTime: { gt: reqStart } },
                    {
                        OR: [
                            { status: "CONFIRMED" },
                            {
                                status: "PENDING_CONFIRM",
                                expiresAt: { gt: new Date() },
                            },
                        ],
                    },
                ],
            },
        });

        const bookedCount = result._sum.quantity || 0;
        const available = bike.totalStock - bike.brokenCount - bookedCount;
        availability[bike.id] = Math.max(0, available);
    }

    return availability;
}
