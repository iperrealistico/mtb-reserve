import { db } from "@/lib/db";
import { createZonedDate } from "@/lib/time";
import { TenantSettings, BlockedDateRange } from "@/lib/tenants";
import { isDateBlocked, isDateInBookingWindow } from "@/lib/blocked-dates";

export interface TimeSlot {
    id: string; // "morning" | "afternoon" | "full-day"
    label: string;
    start: string; // "09:00"
    end: string;   // "13:00"
}

export type AvailabilityResult = {
    [bikeTypeId: string]: number; // Available count
};

export interface AvailabilityCheck {
    availability: AvailabilityResult;
    dateBlocked: boolean;
    outsideWindow: boolean;
    reason?: string;
}

export async function getBikeAvailability(
    tenantSlug: string,
    date: Date,
    startTimeStr: string,
    endTimeStr: string,
    timezone: string = "Europe/Rome",
    settings?: TenantSettings
): Promise<AvailabilityResult> {
    // Check blocked dates (both legacy and new ranges)
    const dateStr = date.toISOString().split('T')[0];

    // Legacy blocked dates check
    if (settings?.blockedDates?.includes(dateStr)) {
        return {};
    }

    // New blocked date ranges check
    if (settings?.blockedDateRanges && isDateBlocked(date, settings.blockedDateRanges)) {
        return {};
    }

    // Check advance notice window
    const minDays = settings?.minAdvanceDays ?? 0;
    const maxDays = settings?.maxAdvanceDays ?? 30;

    const windowCheck = isDateInBookingWindow(date, minDays, maxDays, timezone);
    if (!windowCheck.allowed) {
        // Return empty availability if outside booking window
        const bikeTypes = await db.bikeType.findMany({ where: { tenantSlug } });
        const empty: AvailabilityResult = {};
        bikeTypes.forEach(b => empty[b.id] = 0);
        return empty;
    }

    // 1. Get all bike types for this tenant
    const bikeTypes = await db.bikeType.findMany({
        where: { tenantSlug },
    });

    // 2. Define the requested interval for the specific date in the specific timezone
    const reqStart = createZonedDate(date, startTimeStr, timezone);
    const reqEnd = createZonedDate(date, endTimeStr, timezone);

    // Legacy: Check Min Advance Hours (for backward compatibility)
    if (settings?.minAdvanceHours && settings.minAdvanceHours > 0) {
        const now = new Date();
        const minStart = new Date(now.getTime() + settings.minAdvanceHours * 60 * 60 * 1000);
        if (reqStart < minStart) {
            const empty: AvailabilityResult = {};
            bikeTypes.forEach(b => empty[b.id] = 0);
            return empty;
        }
    }

    // 3. Count Overlapping Bookings for each Bike Type
    // Overlap: (BookingStart < ReqEnd) AND (BookingEnd > ReqStart)
    const availability: AvailabilityResult = {};

    for (const bike of bikeTypes) {
        // Count confirmed/pending bookings via BookingItem
        const result = await db.bookingItem.aggregate({
            _sum: {
                quantity: true,
            },
            where: {
                bikeTypeId: bike.id,
                booking: {
                    tenantSlug,
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
            },
        });

        const bookedCount = result._sum.quantity || 0;
        const available = bike.totalStock - bike.brokenCount - bookedCount;
        availability[bike.id] = Math.max(0, available);
    }

    return availability;
}

/**
 * Extended availability check that returns more detailed information
 */
export async function checkDateAvailability(
    tenantSlug: string,
    date: Date,
    startTimeStr: string,
    endTimeStr: string,
    timezone: string = "Europe/Rome",
    settings?: TenantSettings
): Promise<AvailabilityCheck> {
    const dateStr = date.toISOString().split('T')[0];

    // Check if date is blocked
    const isBlocked =
        settings?.blockedDates?.includes(dateStr) ||
        (settings?.blockedDateRanges && isDateBlocked(date, settings.blockedDateRanges));

    if (isBlocked) {
        return {
            availability: {},
            dateBlocked: true,
            outsideWindow: false,
            reason: "This date is not available for bookings",
        };
    }

    // Check advance notice window
    const minDays = settings?.minAdvanceDays ?? 0;
    const maxDays = settings?.maxAdvanceDays ?? 30;

    const windowCheck = isDateInBookingWindow(date, minDays, maxDays, timezone);
    if (!windowCheck.allowed) {
        return {
            availability: {},
            dateBlocked: false,
            outsideWindow: true,
            reason: windowCheck.reason,
        };
    }

    // Get actual availability
    const availability = await getBikeAvailability(
        tenantSlug,
        date,
        startTimeStr,
        endTimeStr,
        timezone,
        settings
    );

    return {
        availability,
        dateBlocked: false,
        outsideWindow: false,
    };
}
