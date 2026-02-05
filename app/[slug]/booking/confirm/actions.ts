"use server";

import { db } from "@/lib/db";
import { sendEmail } from "@/lib/email";
import { rateLimit } from "@/lib/rate-limit";
import { headers } from "next/headers";
import { logEvent } from "@/lib/events";
import { generateUniqueBookingCode } from "@/lib/site-settings";
import { getTenantSettings } from "@/lib/tenants";
import { format } from "date-fns";


export async function confirmBookingAction(_prevState: unknown, formData: FormData) {
    // Rate Limit
    const headerList = await headers();
    const ip = headerList.get("x-forwarded-for") || "127.0.0.1";

    // 5 attempts per 15 minutes
    const limitResult = await rateLimit(`confirm_booking:${ip}`, 5, 900);
    if (!limitResult.success) {
        return { success: false, error: "Too many attempts. Please try again later." };
    }

    const token = formData.get("token") as string;
    const tos = formData.get("tos") as string;
    const responsibility = formData.get("responsibility") as string;

    if (!token) return { success: false, error: "Invalid token" };
    if (tos !== "on") return { success: false, error: "You must accept the Terms and Conditions." };
    if (responsibility !== "on") return { success: false, error: "You must confirm your responsibility declaration." };

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

    // Generate booking code
    const bookingCode = await generateUniqueBookingCode();

    // ATOMIC TRANSACTION to re-verify and confirm
    try {
        await db.$transaction(async (tx) => {
            // 1. Re-check availability
            const aggregateResult = await tx.booking.aggregate({
                _sum: { quantity: true },
                where: {
                    tenantSlug: booking.tenantSlug,
                    bikeTypeId: booking.bikeTypeId,
                    id: { not: booking.id },
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

            if (isExpired) {
                throw new Error("Your confirmation link has expired (30 min limit). Please start a new booking.");
            }

            // 2. Update status and set booking code
            await tx.booking.update({
                where: { id: booking.id },
                data: {
                    status: "CONFIRMED",
                    tosAcceptedAt: new Date(),
                    bookingCode,
                } as any
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
        metadata: { email: booking.customerEmail, bookingCode }
    });

    // Get tenant settings for pickup location
    const settings = getTenantSettings(booking.tenant);
    const pickupUrl = settings.pickupLocationUrl;

    // Calculate slot time
    const dateStr = format(booking.startTime, "EEEE, MMMM d, yyyy");
    const startTimeStr = format(booking.startTime, "h:mm a");
    const endTimeStr = format(booking.endTime, "h:mm a");

    // Send enhanced "Booking Confirmed" email to User
    await sendEmail({
        to: booking.customerEmail,
        subject: `Booking Confirmed - ${bookingCode}`,
        category: 'recap',
        entityId: booking.id,
        html: `
            <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto;">
                <h1 style="color: #1a1a1a; font-size: 24px; margin-bottom: 24px;">Your booking is confirmed</h1>
                
                <div style="background: #f7f7f7; padding: 24px; border-radius: 12px; margin-bottom: 24px;">
                    <p style="font-size: 14px; color: #666; margin: 0 0 8px 0;">Booking Code</p>
                    <p style="font-size: 28px; font-weight: bold; color: #1a1a1a; margin: 0; letter-spacing: 2px;">${bookingCode}</p>
                </div>
                
                <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
                    <tr>
                        <td style="padding: 12px 0; border-bottom: 1px solid #eee; color: #666;">Date</td>
                        <td style="padding: 12px 0; border-bottom: 1px solid #eee; text-align: right; font-weight: 500;">${dateStr}</td>
                    </tr>
                    <tr>
                        <td style="padding: 12px 0; border-bottom: 1px solid #eee; color: #666;">Time</td>
                        <td style="padding: 12px 0; border-bottom: 1px solid #eee; text-align: right; font-weight: 500;">${startTimeStr} - ${endTimeStr}</td>
                    </tr>
                    <tr>
                        <td style="padding: 12px 0; border-bottom: 1px solid #eee; color: #666;">Bike</td>
                        <td style="padding: 12px 0; border-bottom: 1px solid #eee; text-align: right; font-weight: 500;">${booking.bikeType.name}</td>
                    </tr>
                    <tr>
                        <td style="padding: 12px 0; border-bottom: 1px solid #eee; color: #666;">Quantity</td>
                        <td style="padding: 12px 0; border-bottom: 1px solid #eee; text-align: right; font-weight: 500;">${booking.quantity}</td>
                    </tr>
                    <tr>
                        <td style="padding: 12px 0; border-bottom: 1px solid #eee; color: #666;">Name</td>
                        <td style="padding: 12px 0; border-bottom: 1px solid #eee; text-align: right; font-weight: 500;">${booking.customerName}</td>
                    </tr>
                </table>
                
                ${pickupUrl ? `
                <div style="background: #e7f5ff; padding: 16px; border-radius: 8px; margin-bottom: 24px;">
                    <p style="margin: 0 0 8px 0; font-weight: 500; color: #1a1a1a;">Pickup Location</p>
                    <a href="${pickupUrl}" style="color: #0066cc; text-decoration: none;">Open in Google Maps</a>
                </div>
                ` : ''}
                
                <div style="background: #fff3cd; padding: 16px; border-radius: 8px; margin-bottom: 24px;">
                    <p style="margin: 0; color: #664d03; font-size: 14px;">
                        <strong>Important:</strong> Please arrive at the pickup location on time. Payment is due on-site. No-shows may affect future booking privileges.
                    </p>
                </div>
                
                <p style="color: #666; font-size: 14px;">
                    Questions? Contact ${booking.tenant.name} at ${booking.tenant.contactEmail}
                </p>
            </div>
        `
    });

    // Notify Admin
    await sendEmail({
        to: (booking.tenant as any).registrationEmail,
        subject: `New Confirmed Booking: ${booking.customerName} [${bookingCode}]`,
        category: 'admin_notification',
        entityId: `admin_${booking.id}`,
        html: `
            <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
                <h2>New Booking Confirmed</h2>
                <p><strong>Booking Code:</strong> ${bookingCode}</p>
                <p><strong>Customer:</strong> ${booking.customerName}</p>
                <p><strong>Phone:</strong> ${booking.customerPhone}</p>
                <p><strong>Email:</strong> ${booking.customerEmail}</p>
                <p><strong>Date:</strong> ${dateStr}</p>
                <p><strong>Time:</strong> ${startTimeStr} - ${endTimeStr}</p>
                <p><strong>Bike:</strong> ${booking.bikeType.name} x ${booking.quantity}</p>
            </div>
        `
    });

    return { success: true, error: "", bookingCode };
}
