"use server";

import { db } from "@/lib/db";
import { sendBookingRecap, sendAdminNotification } from "@/lib/email";

export async function confirmBookingAction(token: string) {
    if (!token) return { error: "Missing token" };

    try {
        const result = await db.$transaction(async (tx: any) => {
            // 1. Find Booking
            const booking = await tx.booking.findUnique({
                where: { confirmationToken: token },
                include: { bikeType: true },
            });

            if (!booking) throw new Error("Invalid or expired link");
            if (booking.status === "CONFIRMED") return { success: true, alreadyConfirmed: true, booking };
            if (booking.status !== "PENDING_CONFIRM") throw new Error("Booking is no longer valid");

            // Check Expiry
            if (booking.expiresAt && booking.expiresAt < new Date()) {
                throw new Error("Confirmation link expired");
            }

            // 2. Re-Check Stock (Strict)
            // Count all CONFIRMED bookings for this slot + This one (which is currently PENDING)
            // Actually, simply: Count CONFIRMED bookings overlapping.
            // If (Total - Broken - Confirmed) < ThisBooking.Quantity -> Fail.

            const overlappingCount = await tx.booking.count({
                where: {
                    tenantSlug: booking.tenantSlug,
                    bikeTypeId: booking.bikeTypeId,
                    status: "CONFIRMED",
                    startTime: { lt: booking.endTime },
                    endTime: { gt: booking.startTime },
                },
            });

            const available = booking.bikeType.totalStock - booking.bikeType.brokenCount - overlappingCount;
            if (available < booking.quantity) {
                throw new Error("Sorry, these bikes were taken while you were waiting. Please contact us.");
            }

            // 3. Confirm
            const updated = await tx.booking.update({
                where: { id: booking.id },
                data: {
                    status: "CONFIRMED",
                    confirmationToken: null, // Consume token? Or keep it for reference? Security: consume it.
                    // Logic said "Prevent double-confirmation". Clearing it or checking status handles it.
                },
            });

            return { success: true, booking: updated };
        });

        // 4. Send Emails
        if (result.success) {
            const tenant = await db.tenant.findUnique({ where: { slug: result.booking.tenantSlug } });

            // Send to Customer
            await sendBookingRecap(result.booking.customerEmail, result.booking);

            // Send to Admin
            if (tenant && tenant.contactEmail) {
                await sendAdminNotification(tenant.contactEmail, result.booking);
            }
        }

        return result;

    } catch (err: any) {
        return { error: err.message || "Confirmation failed" };
    }
}
