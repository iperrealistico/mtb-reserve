import { describe, it, expect, vi, beforeEach } from 'vitest';
import { confirmBookingAction } from '@/app/[slug]/booking/confirm/actions';
import { db } from '@/lib/db';
import { sendEmail } from '@/lib/email';

vi.mock('@/lib/db', () => ({
    db: {
        booking: {
            findUnique: vi.fn(),
            findFirst: vi.fn(),
            update: vi.fn(),
        },
        bookingItem: {
            aggregate: vi.fn(),
        },
        $transaction: vi.fn((cb) => cb(db)),
    },
}));

vi.mock('@/lib/recaptcha', () => ({
    verifyRecaptcha: vi.fn().mockResolvedValue(true),
}));

vi.mock('@/lib/email', () => ({
    sendEmail: vi.fn().mockResolvedValue({}),
}));

vi.mock('@/lib/rate-limit', () => ({
    rateLimit: vi.fn().mockResolvedValue({ success: true, limit: 5, remaining: 4, reset: new Date() }),
}));

describe('confirmBookingAction', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should FAIL if the booking is expired', async () => {
        // GIVEN: An expired booking
        const booking = {
            id: 'b1',
            status: 'PENDING_CONFIRM',
            expiresAt: new Date(Date.now() - 10000), // 10s ago
            quantity: 1,
            tenantSlug: 't1',
            bikeTypeId: 'bt1',
            startTime: new Date(),
            endTime: new Date(),
            bikeType: { totalStock: 1, brokenCount: 0 },
            customerEmail: 'test@test.com',
            tenant: { contactEmail: 'admin@test.com', name: 'T1' }
        };
        vi.mocked(db.booking.findUnique).mockResolvedValue(booking as never);
        vi.mocked(db.bookingItem.aggregate).mockResolvedValue({ _sum: { quantity: 0 } } as never);

        const formData = new FormData();
        formData.append('token', 'tkn1');
        formData.append('tos', 'on');
        formData.append('responsibility', 'on');

        const result = await confirmBookingAction({}, formData);

        expect(result.success).toBe(false);
        expect(result.error).toContain('expired');
        expect(db.booking.update).not.toHaveBeenCalled();
    });

    it('should send recap and admin notification emails when the booking is confirmed', async () => {
        const booking = {
            id: 'b1',
            status: 'PENDING_CONFIRM',
            expiresAt: new Date(Date.now() + 60_000),
            quantity: 2,
            totalPrice: 120,
            tenantSlug: 't1',
            bikeTypeId: 'bt1',
            startTime: new Date('2026-05-01T09:00:00.000Z'),
            endTime: new Date('2026-05-01T11:00:00.000Z'),
            bikeType: { id: 'bt1', name: 'E-Bike', totalStock: 4, brokenCount: 0 },
            items: [
                {
                    bikeTypeId: 'bt1',
                    quantity: 2,
                    bikeType: { id: 'bt1', name: 'E-Bike', totalStock: 4, brokenCount: 0 },
                },
            ],
            customerName: 'Alice Rider',
            customerEmail: 'alice@example.com',
            customerPhone: '+39 333 0000000',
            tenant: {
                name: 'Trail Hub',
                contactEmail: 'bookings@trailhub.test',
                registrationEmail: 'owner@trailhub.test',
                settings: {},
            },
        };

        vi.mocked(db.booking.findUnique).mockResolvedValue(booking as never);
        vi.mocked(db.bookingItem.aggregate).mockResolvedValue({ _sum: { quantity: 0 } } as never);

        const formData = new FormData();
        formData.append('token', 'tkn1');
        formData.append('tos', 'on');
        formData.append('responsibility', 'on');

        const result = await confirmBookingAction({}, formData);

        expect(result.success).toBe(true);
        expect(sendEmail).toHaveBeenCalledTimes(2);
        expect(vi.mocked(sendEmail).mock.calls[0]?.[0]).toMatchObject({
            to: 'alice@example.com',
            category: 'recap',
            entityId: 'b1',
        });
        expect(vi.mocked(sendEmail).mock.calls[1]?.[0]).toMatchObject({
            to: 'owner@trailhub.test',
            category: 'admin_notification',
            entityId: 'admin_b1',
        });
        expect(db.booking.update).toHaveBeenCalled();
    });
});
