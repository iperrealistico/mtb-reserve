
import { toZonedTime, fromZonedTime } from 'date-fns-tz';

/**
 * Converts a "naive" date (from a date picker, e.g. "2024-05-20T00:00:00.000Z")
 * and a time string (e.g. "09:00") into a UTC Date object that represents 
 * that specific time in the target timezone.
 * 
 * Example: 
 * Input: 2024-05-20, "09:00", "Europe/Rome"
 * Output: Date object representing 2024-05-20 09:00 Rome Time (which is 07:00 UTC)
 */
export function createZonedDate(baseDate: Date, timeStr: string, timeZone: string): Date {
    const [hours, minutes] = timeStr.split(':').map(Number);

    // 1. Create a string representation of the target time in ISO-like format without offset
    // We assume baseDate is "YYYY-MM-DD..."
    const year = baseDate.getFullYear();
    const month = String(baseDate.getMonth() + 1).padStart(2, '0');
    const day = String(baseDate.getDate()).padStart(2, '0');
    const hh = String(hours).padStart(2, '0');
    const mm = String(minutes).padStart(2, '0');

    // Construct "2024-05-20T09:00:00"
    // This is the "Wall Clock" time we want to enforce
    const isoString = `${year}-${month}-${day}T${hh}:${mm}:00`;

    // 2. Convert this "Wall Clock" time in the given timezone to absolute UTC Date
    return fromZonedTime(isoString, timeZone);
}
