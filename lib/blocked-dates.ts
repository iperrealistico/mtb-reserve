import { BlockedDateRange } from "./tenants";

/**
 * Check if a date falls within any blocked date range.
 * Handles both fixed date ranges and yearly recurring ranges.
 */
export function isDateBlocked(date: Date, ranges: BlockedDateRange[]): boolean {
    if (!ranges || ranges.length === 0) return false;

    const dateStr = formatDateStr(date);
    const month = date.getMonth() + 1; // 1-indexed
    const day = date.getDate();

    for (const range of ranges) {
        if (range.recurringYearly) {
            // For recurring, check if month/day falls within the range (ignoring year)
            if (isDateInRecurringRange(month, day, range.start, range.end)) {
                return true;
            }
        } else {
            // For fixed ranges, check exact date strings
            if (dateStr >= range.start && dateStr <= range.end) {
                return true;
            }
        }
    }

    return false;
}

/**
 * Check if a month/day falls within a recurring yearly range.
 * Handles ranges that span across year boundaries (e.g., Dec 20 - Jan 10)
 */
function isDateInRecurringRange(month: number, day: number, startStr: string, endStr: string): boolean {
    const startMonth = parseInt(startStr.slice(5, 7));
    const startDay = parseInt(startStr.slice(8, 10));
    const endMonth = parseInt(endStr.slice(5, 7));
    const endDay = parseInt(endStr.slice(8, 10));

    const current = month * 100 + day; // e.g., 1225 for Dec 25
    const start = startMonth * 100 + startDay;
    const end = endMonth * 100 + endDay;

    if (start <= end) {
        // Normal range (e.g., Mar 1 - Mar 15)
        return current >= start && current <= end;
    } else {
        // Range spans year boundary (e.g., Dec 20 - Jan 10)
        return current >= start || current <= end;
    }
}

/**
 * Get all blocked dates in a given month.
 * Returns array of day numbers that are blocked.
 */
export function getBlockedDaysInMonth(year: number, month: number, ranges: BlockedDateRange[]): number[] {
    const blockedDays: number[] = [];
    const daysInMonth = new Date(year, month, 0).getDate();

    for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(year, month - 1, day);
        if (isDateBlocked(date, ranges)) {
            blockedDays.push(day);
        }
    }

    return blockedDays;
}

/**
 * Check if a date is within the allowed booking window based on advance notice settings.
 * Returns { allowed: boolean, reason?: string }
 */
export function isDateInBookingWindow(
    date: Date,
    minAdvanceDays: number,
    maxAdvanceDays: number,
    timezone: string = "Europe/Rome"
): { allowed: boolean; reason?: string } {
    // Get "today" in the tenant's timezone
    const now = new Date();
    const todayStr = now.toLocaleDateString("en-CA", { timeZone: timezone }); // YYYY-MM-DD format
    const today = new Date(todayStr);
    today.setHours(0, 0, 0, 0);

    // Normalize the target date
    const targetDateStr = formatDateStr(date);
    const target = new Date(targetDateStr);
    target.setHours(0, 0, 0, 0);

    // Calculate days difference
    const diffTime = target.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < minAdvanceDays) {
        return {
            allowed: false,
            reason: `Bookings require at least ${minAdvanceDays} day(s) advance notice`,
        };
    }

    if (diffDays > maxAdvanceDays) {
        return {
            allowed: false,
            reason: `Bookings can only be made up to ${maxAdvanceDays} days in advance`,
        };
    }

    return { allowed: true };
}

/**
 * Format a Date object to YYYY-MM-DD string
 */
function formatDateStr(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
}

/**
 * Check both blocked dates and advance notice in one call.
 * Returns { allowed: boolean, reason?: string }
 */
export function isDateAvailableForBooking(
    date: Date,
    blockedRanges: BlockedDateRange[],
    minAdvanceDays: number,
    maxAdvanceDays: number,
    timezone: string = "Europe/Rome"
): { allowed: boolean; reason?: string } {
    // Check blocked dates first
    if (isDateBlocked(date, blockedRanges)) {
        return { allowed: false, reason: "This date is not available for bookings" };
    }

    // Check advance notice window
    return isDateInBookingWindow(date, minAdvanceDays, maxAdvanceDays, timezone);
}
