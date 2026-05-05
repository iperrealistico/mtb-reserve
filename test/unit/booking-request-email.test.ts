import { beforeEach, describe, expect, it, vi } from 'vitest';
import { submitBookingAction } from '@/app/[slug]/actions';
import { db } from '@/lib/db';
import { sendConfirmationLink } from '@/lib/email';
import { getComputedSlots, getTenantBySlug, getTenantRouteSlug } from '@/lib/tenants';
import { createZonedDate } from '@/lib/time';

vi.mock('@/lib/db', () => ({
    db: {
        bikeType: {
            findUnique: vi.fn(),
        },
        bookingItem: {
            aggregate: vi.fn(),
        },
        booking: {
            create: vi.fn(),
            delete: vi.fn(),
        },
        $transaction: vi.fn(),
    },
}));

vi.mock('@/lib/tenants', () => ({
    getTenantBySlug: vi.fn(),
    getTenantSettings: vi.fn(),
    getComputedSlots: vi.fn(),
    getTenantRouteSlug: vi.fn(),
}));

vi.mock('@/lib/time', () => ({
    createZonedDate: vi.fn(),
}));

vi.mock('@/lib/email', () => ({
    sendConfirmationLink: vi.fn(),
}));

vi.mock('@/lib/rate-limit', () => ({
    rateLimit: vi.fn().mockResolvedValue({ success: true, limit: 10, remaining: 9, reset: new Date() }),
}));

describe('submitBookingAction email flow', () => {
    beforeEach(() => {
        vi.clearAllMocks();

        vi.mocked(getTenantBySlug).mockResolvedValue({ slug: 'trail-hub', timezone: 'Europe/Rome' } as never);
        vi.mocked(getComputedSlots).mockReturnValue([{ id: 'morning', start: '09:00', end: '11:00' }] as never);
        vi.mocked(getTenantRouteSlug).mockReturnValue('trail-hub');

        const start = new Date('2026-05-01T09:00:00.000Z');
        const end = new Date('2026-05-01T11:00:00.000Z');
        vi.mocked(createZonedDate)
            .mockReturnValueOnce(start)
            .mockReturnValueOnce(end);

        vi.mocked(db.bikeType.findUnique).mockResolvedValue({
            id: 'bike-1',
            name: 'E-Bike',
            totalStock: 5,
            brokenCount: 0,
            costPerHour: 20,
        } as never);
        vi.mocked(db.bookingItem.aggregate).mockResolvedValue({ _sum: { quantity: 0 } } as never);
        vi.mocked(db.booking.create).mockResolvedValue({
            id: 'booking-1',
            confirmationToken: 'token-123',
        } as never);
        vi.mocked(db.$transaction).mockImplementation(async (callback: (tx: typeof db) => unknown) => callback(db) as never);
    });

    it('rolls back the pending booking if the confirmation email cannot be sent', async () => {
        vi.mocked(sendConfirmationLink).mockResolvedValue({ error: new Error('Resend down') });

        const formData = new FormData();
        formData.append('slug', 'trail-hub');
        formData.append('date', '2026-05-01');
        formData.append('slotId', 'morning');
        formData.append('bikeTypeId', 'bike-1');
        formData.append('quantity', '2');
        formData.append('customerName', 'Alice Rider');
        formData.append('customerEmail', 'alice@example.com');
        formData.append('customerPhone', '+39 333 0000000');

        const result = await submitBookingAction({}, formData);

        expect(result).toEqual({
            error: 'We could not send the confirmation email. Please try again.',
        });
        expect(db.booking.delete).toHaveBeenCalledWith({ where: { id: 'booking-1' } });
    });
});
