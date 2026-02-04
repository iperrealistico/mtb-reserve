import { db } from "@/lib/db";
import { getBikeAvailability, AvailabilityResult } from "@/lib/availability";
import { bookingSchema } from "@/lib/schemas";
import { getTenantBySlug, getTenantSettings, TenantSlot } from "@/lib/tenants";
import { randomUUID } from "crypto";

import { createZonedDate } from "@/lib/time";
import { sendConfirmationLink } from "@/lib/email";

function getComputedSlots(tenant: any): TenantSlot[] {
    const settings = getTenantSettings(tenant);
    const slots = [...(settings.slots || [])]; // Copy

    if (settings.fullDayEnabled && slots.length > 0) {
        // Compute min start and max end
        // Simplistic: Sort by start time?
        // For MVP, lets just assume Morning/Afternoon are ordered or just take min/max strings.
        let minStart = slots[0].start;
        let maxEnd = slots[0].end;

        for (const s of slots) {
            if (s.start < minStart) minStart = s.start;
            if (s.end > maxEnd) maxEnd = s.end;
        }

        slots.push({
            id: "full-day",
            label: `Full Day (${minStart} - ${maxEnd})`,
            start: minStart,
            end: maxEnd
        });
    }

    return slots;
}

export async function getAvailabilityAction(slug: string, date: Date) {
    const tenant = await getTenantBySlug(slug);
    if (!tenant) return { slots: [], availability: {} }; // Validation?

    const timezone = tenant.timezone || "Europe/Rome";
    const settings = getComputedSlots(tenant);
    const result: Record<string, AvailabilityResult> = {};

    for (const slot of settings) {
        result[slot.id] = await getBikeAvailability(slug, date, slot.start, slot.end, timezone);
    }

    return { slots: settings, availability: result, timezone };
}

export async function submitBookingAction(prevState: any, formData: FormData) {
    // Parse Form Data (manual parsing or use library helper)
    // For simplicity, we assume client sends JSON or structured data, but Server Actions receive FormData mostly.
    // We'll trust the client component to send structured args if we change signature, 
    // but standard form action sends FormData. 
    // Let's expect structured object for this action if called from JS, 
    // OR we parse FormData.

    // To keep it simple with useFormState, we usually bind args or parse FormData.
    // We'll parse FormData manually.

    const rawData = {
        slug: formData.get("slug"),
        date: new Date(formData.get("date") as string),
        slotId: formData.get("slotId"),
        bikeTypeId: formData.get("bikeTypeId"),
        quantity: Number(formData.get("quantity")),
        customerName: formData.get("customerName"),
        customerEmail: formData.get("customerEmail"),
        customerPhone: formData.get("customerPhone"),
    };

    const validation = bookingSchema.safeParse(rawData);
    if (!validation.success) {
        return { error: "Invalid data", details: validation.error.flatten() };
    }

    const data = validation.data;
    const tenant = await getTenantBySlug(data.slug);
    if (!tenant) return { error: "Tenant not found" };

    const timezone = tenant.timezone || "Europe/Rome";

    // Determine Times (Dynamic)
    const availableSlots = getComputedSlots(tenant);
    const slot = availableSlots.find(s => s.id === data.slotId);
    if (!slot) return { error: "Invalid slot" };

    const startTime = createZonedDate(data.date, slot.start, timezone);
    const endTime = createZonedDate(data.date, slot.end, timezone);

    // ATOMIC TRANSACTION
    try {
        const booking = await db.$transaction(async (tx: any) => { // Using any to avoid complex import for now, or Prisma.TransactionClient
            // 1. Re-Check Availability INSIDE Transaction
            // Calculate overlapping bookings count
            const bikeType = await tx.bikeType.findUnique({ where: { id: data.bikeTypeId } });
            if (!bikeType) throw new Error("Invalid bike type");

            const overlappingCount = await tx.booking.count({
                where: {
                    tenantSlug: data.slug,
                    bikeTypeId: data.bikeTypeId,
                    status: { in: ["CONFIRMED", "PENDING_CONFIRM"] },
                    startTime: { lt: endTime },
                    endTime: { gt: startTime },
                },
            });

            const available = bikeType.totalStock - bikeType.brokenCount - overlappingCount;
            if (available < data.quantity) {
                throw new Error("No longer available");
            }

            // 2. Create Booking
            const token = randomUUID();
            return await tx.booking.create({
                data: {
                    tenantSlug: data.slug,
                    bikeTypeId: data.bikeTypeId,
                    status: "PENDING_CONFIRM",
                    startTime,
                    endTime,
                    quantity: data.quantity,
                    customerName: data.customerName,
                    customerEmail: data.customerEmail,
                    customerPhone: data.customerPhone,
                    confirmationToken: token,
                    // 30 min expiry
                    expiresAt: new Date(Date.now() + 30 * 60 * 1000),
                },
            });
        });

        // 3. Send Email
        await sendConfirmationLink(data.customerEmail, data.slug, booking.confirmationToken!);

        return { success: true, bookingId: booking.id };

    } catch (err: any) {
        return { error: err.message || "Booking failed" };
    }
}
