import { describe, it, expect, vi, beforeEach } from 'vitest';
import { confirmBookingAction } from '@/app/[slug]/booking/confirm/actions';
import { db } from '@/lib/db';

vi.mock('@/lib/db', () => ({
    db: {
        booking: {
            findUnique: vi.fn(),
            aggregate: vi.fn(),
            update: vi.fn(),
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
        (db.booking.findUnique as any).mockResolvedValue(booking);
        (db.booking.aggregate as any).mockResolvedValue({ _sum: { quantity: 0 } });

        const formData = new FormData();
        formData.append('token', 'tkn1');
        formData.append('tos', 'on');
        formData.append('recaptchaToken', 'mock');

        const result = await confirmBookingAction({}, formData);

        expect(result.success).toBe(false);
        expect(result.error).toContain('expired');
        expect(db.booking.update).not.toHaveBeenCalled();
    });
});
