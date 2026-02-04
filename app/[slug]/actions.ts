"use server";

import { db } from "@/lib/db";
import { getBikeAvailability, AvailabilityResult } from "@/lib/availability";
import { bookingSchema } from "@/lib/schemas";
import { getTenantBySlug } from "@/lib/tenants";
import { randomUUID } from "crypto";

// Helper to define slots (should move to tenant settings later)
const SLOTS = [
    { id: "morning", label: "Morning (09:00 - 13:00)", start: "09:00", end: "13:00" },
    { id: "afternoon", label: "Afternoon (14:00 - 18:00)", start: "14:00", end: "18:00" },
    { id: "full-day", label: "Full Day (09:00 - 18:00)", start: "09:00", end: "18:00" },
];

export async function getAvailabilityAction(slug: string, date: Date) {
    const settings = SLOTS; // TODO: Load from tenant settings
    const result: Record<string, AvailabilityResult> = {};

    for (const slot of settings) {
        result[slot.id] = await getBikeAvailability(slug, date, slot.start, slot.end);
    }

    return { slots: settings, availability: result };
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

    // Determine Times (Hardcoded for MVP based on Slot ID)
    // Real app: lookup slot config from tenant settings
    const slot = SLOTS.find(s => s.id === data.slotId);
    if (!slot) return { error: "Invalid slot" };

    const [startH, startM] = slot.start.split(":").map(Number);
    const [endH, endM] = slot.end.split(":").map(Number);

    const startTime = new Date(data.date);
    startTime.setHours(startH, startM, 0, 0);

    const endTime = new Date(data.date);
    endTime.setHours(endH, endM, 0, 0);

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

        // 3. Send Email (Mock)
        console.log(`[EMAIL] Sending confirmation link to ${data.customerEmail}: /${data.slug}/confirm?token=${booking.confirmationToken}`);

        return { success: true, bookingId: booking.id };

    } catch (err: any) {
        return { error: err.message || "Booking failed" };
    }
}
