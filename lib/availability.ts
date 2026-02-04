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
    timezone: string = "Europe/Rome"
): Promise<AvailabilityResult> {
    // 1. Get all bike types for this tenant
    const bikeTypes = await db.bikeType.findMany({
        where: { tenantSlug },
    });

    // 2. Define the requested interval for the specific date in the specific timezone
    const reqStart = createZonedDate(date, startTimeStr, timezone);
    const reqEnd = createZonedDate(date, endTimeStr, timezone);

    // 3. Count Overlapping Bookings for each Bike Type
    // Overlap: (BookingStart < ReqEnd) AND (BookingEnd > ReqStart)
    const availability: AvailabilityResult = {};

    for (const bike of bikeTypes) {
        const overlappingBookings = await db.booking.count({
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

        const available = bike.totalStock - bike.brokenCount - overlappingBookings;
        availability[bike.id] = Math.max(0, available);
    }

    return availability;
}
