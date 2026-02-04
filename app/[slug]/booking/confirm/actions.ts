"use server";

import { db } from "@/lib/db";
import { sendEmail } from "@/lib/email";
import { rateLimit } from "@/lib/rate-limit";
import { headers } from "next/headers";
import { verifyRecaptcha } from "@/lib/recaptcha";

import { logEvent } from "@/lib/events";


export async function confirmBookingAction(_prevState: unknown, formData: FormData) {
    // Rate Limit
    const headerList = await headers();
    const ip = headerList.get("x-forwarded-for") || "127.0.0.1";

    // 5 attempts per 15 minutes
    const limitResult = await rateLimit(`confirm_booking:${ip}`, 5, 900);
    if (!limitResult.success) {
        return { success: false, error: "Too many attempts. Please try again later." };
    }

    // ReCAPTCHA
    const recaptchaToken = formData.get("recaptchaToken") as string;
    const isHuman = await verifyRecaptcha(recaptchaToken);
    if (!isHuman) {
        return { success: false, error: "Security check failed. Please try again." };
    }

    const token = formData.get("token") as string;
    const tos = formData.get("tos") as string;

    if (!token) return { success: false, error: "Invalid token" };
    if (tos !== "on") return { success: false, error: "You must accept the Terms and Conditions." };

    const booking = await db.booking.findUnique({
        where: { confirmationToken: token },
        include: { tenant: true, bikeType: true }
    });

    if (!booking) return { success: false, error: "Booking not found or expired." };

    if (booking.status === "CONFIRMED") {
        return { success: false, error: "Booking is already confirmed." };
    }

    const now = new Date();
    const isExpired = booking.expiresAt && booking.expiresAt < now;

    // ATOMIC TRANSACTION to re-verify and confirm
    try {
        await db.$transaction(async (tx) => {
            // 1. Re-check availability if expired (if not expired, it was already accounted for)
            // Actually, best to always re-check for total safety.
            const aggregateResult = await tx.booking.aggregate({
                _sum: { quantity: true },
                where: {
                    tenantSlug: booking.tenantSlug,
                    bikeTypeId: booking.bikeTypeId,
                    id: { not: booking.id }, // Exclude self
                    AND: [
                        { startTime: { lt: booking.endTime } },
                        { endTime: { gt: booking.startTime } },
                        {
                            OR: [
                                { status: "CONFIRMED" },
                                {
                                    status: "PENDING_CONFIRM",
                                    expiresAt: { gt: now },
                                },
                            ],
                        },
                    ],
                },
            });

            const othersBookedCount = aggregateResult._sum.quantity || 0;
            const available = booking.bikeType.totalStock - booking.bikeType.brokenCount - othersBookedCount;

            if (available < booking.quantity) {
                throw new Error("This slot is no longer available. Your pending booking might have expired and been taken by someone else.");
            }

            // 2. If expired, we still allow confirmation if stock is there, but maybe we should block it?
            // "Link to Confirmation Page" -> "expires in 30 mins".
            // If we are lenient, we allow it if stock is there.
            // If we are strict, we block if expired. 
            // The prompt says "Expired pending does not block availability". 
            // It doesn't explicitly say expired cannot be confirmed if stock is available.
            // But usually, an expired token should be invalid.
            if (isExpired) {
                throw new Error("Your confirmation link has expired (30 min limit). please start a new booking.");
            }

            // 3. Update status
            await tx.booking.update({
                where: { id: booking.id },
                data: {
                    status: "CONFIRMED",
                    tosAcceptedAt: new Date(),
                }
            });
        });
    } catch (err: unknown) {
        return { success: false, error: (err as Error).message || "Confirmation failed" };
    }


    await logEvent({
        level: "INFO",
        actorType: "GUEST",
        actorId: booking.customerEmail,
        tenantId: booking.tenantSlug,
        eventType: "BOOKING_CONFIRMED",
        message: "Booking confirmed by customer",
        entityType: "Booking",
        entityId: booking.id,
        metadata: { email: booking.customerEmail }
    });


    // Send "Booking Confirmed" email to User
    await sendEmail({
        to: booking.customerEmail,
        subject: `Booking Confirmed: ${booking.bikeType.name} at ${booking.tenant.name}`,
        html: `
            <h1>Your booking is confirmed!</h1>
            <p><strong>Date:</strong> ${booking.startTime.toDateString()}</p>
            <p><strong>Bike:</strong> ${booking.bikeType.name}</p>
            <p><strong>Quantity:</strong> ${booking.quantity}</p>
            <p>See you there!</p>
        `
    });

    // Notify Admin
    await sendEmail({
        to: booking.tenant.contactEmail,
        subject: `New Confirmed Booking: ${booking.customerName}`,
        html: `
            <p>User ${booking.customerName} has confirmed their booking.</p>
            <p><strong>Date:</strong> ${booking.startTime.toDateString()}</p>
            <p><strong>Bike:</strong> ${booking.bikeType.name} (x${booking.quantity})</p>
        `
    });

    return { success: true, error: "" };
}
