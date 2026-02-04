import { db } from "@/lib/db";
import { startOfDay, endOfDay } from "date-fns";

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
    endTimeStr: string
): Promise<AvailabilityResult> {
    // 1. Get all bike types for this tenant
    const bikeTypes = await db.bikeType.findMany({
        where: { tenantSlug },
    });

    // 2. Define the requested interval for the specific date
    // Parse "HH:mm"
    const [startHour, startMin] = startTimeStr.split(":").map(Number);
    const [endHour, endMin] = endTimeStr.split(":").map(Number);

    const reqStart = new Date(date);
    reqStart.setHours(startHour, startMin, 0, 0);

    const reqEnd = new Date(date);
    reqEnd.setHours(endHour, endMin, 0, 0);

    // 3. Count Overlapping Bookings for each Bike Type
    // Overlap: (BookingStart < ReqEnd) AND (BookingEnd > ReqStart)
    const availability: AvailabilityResult = {};

    for (const bike of bikeTypes) {
        const overlappingBookings = await db.booking.count({
            where: {
                tenantSlug,
                bikeTypeId: bike.id,
                status: {
                    in: ["CONFIRMED", "PENDING_CONFIRM"], // Pending counts as taken
                },
                // Timestamps in DB are standard Date objects (UTC usually, but Prisma handles conversion if setup right)
                // We need to be careful with Timezones. 
                // For MVP, assuming server time or naive dates is risky but "date" input is 00:00 local usually.
                // Prisma comparison:
                startTime: {
                    lt: reqEnd,
                },
                endTime: {
                    gt: reqStart,
                },
            },
        });

        const available = bike.totalStock - bike.brokenCount - overlappingBookings;
        availability[bike.id] = Math.max(0, available);
    }

    return availability;
}
