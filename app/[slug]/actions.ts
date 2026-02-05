"use server";

import { db } from "@/lib/db";
import { getBikeAvailability, AvailabilityResult } from "@/lib/availability";
import { bookingSchema } from "@/lib/schemas";
import { getTenantBySlug, getTenantSettings, TenantSlot, getComputedSlots } from "@/lib/tenants";
import { randomUUID } from "crypto";

// ... imports
import { createZonedDate } from "@/lib/time";
import { sendConfirmationLink } from "@/lib/email";
import { rateLimit } from "@/lib/rate-limit";
// Removed verifyRecaptcha import

import { headers } from "next/headers";
import { logEvent } from "@/lib/events";

export async function getAvailabilityAction(slug: string, date: Date) {
    // ... (unchanged)
    const tenant = await getTenantBySlug(slug);
    if (!tenant) return { slots: [], availability: {} }; // Validation?

    const timezone = tenant.timezone || "Europe/Rome";
    const settings = getComputedSlots(tenant);
    const result: Record<string, AvailabilityResult> = {};

    for (const slot of settings) {
        // We need to pass the full settings object which includes blockedDates and minAdvanceHours.
        // But getComputedSlots only returns the array of slots.
        // We should fetch full settings earlier.
        // Refactoring slightly to reuse the full settings object.
        const allSettings = getTenantSettings(tenant);
        result[slot.id] = await getBikeAvailability(slug, date, slot.start, slot.end, timezone, allSettings);
    }

    return { slots: settings, availability: result, timezone };
}

export async function submitBookingAction(prevState: any, formData: FormData) {
    // 1. Rate Limit
    const headerList = await headers();
    const ip = headerList.get("x-forwarded-for") || "127.0.0.1";

    // 10 bookings per hour per IP seem reasonable for normal use, blocking bots
    const limitResult = await rateLimit(`booking_request:${ip}`, 10, 3600);
    if (!limitResult.success) {
        await logEvent({
            level: "WARN",
            actorType: "GUEST",
            eventType: "RATE_LIMIT_BLOCKED",
            message: "Booking rate limit exceeded",
            metadata: { ip, limit: 10, window: 3600 }
        });
        return { error: "Too many booking attempts. Please try again later." };
    }

    // 2. ReCAPTCHA - REMOVED

    // Parse Form Data (manual parsing or use library helper)

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
        const booking = await db.$transaction(async (tx) => {
            // 1. Re-Check Availability INSIDE Transaction
            // Calculate overlapping bookings count
            const bikeType = await tx.bikeType.findUnique({ where: { id: data.bikeTypeId } });
            if (!bikeType) throw new Error("Invalid bike type");

            const aggregateResult = await tx.booking.aggregate({
                _sum: { quantity: true },
                where: {
                    tenantSlug: data.slug,
                    bikeTypeId: data.bikeTypeId,
                    AND: [
                        { startTime: { lt: endTime } },
                        { endTime: { gt: startTime } },
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

            const bookedCount = aggregateResult._sum.quantity || 0;
            const available = bikeType.totalStock - bikeType.brokenCount - bookedCount;
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
                    totalPrice: (bikeType.costPerHour || 0) * ((endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60)) * data.quantity,
                },
            });
        });

        // 3. Send Email
        await sendConfirmationLink(data.customerEmail, data.slug, booking.confirmationToken!);

        await logEvent({
            level: "INFO",
            actorType: "GUEST",
            tenantId: data.slug,
            eventType: "BOOKING_REQUESTED",
            message: "Booking requested by guest",
            entityType: "Booking",
            entityId: booking.id,
            metadata: {
                email: data.customerEmail,
                quantity: data.quantity,
                bikeTypeId: data.bikeTypeId,
                slotId: data.slotId
            }
        });

        return { success: true, bookingId: booking.id };

    } catch (err: any) {
        return { error: err.message || "Booking failed" };
    }
}
