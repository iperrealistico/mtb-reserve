import { beforeEach, describe, expect, it, vi } from 'vitest';
import { cancelBookingAction, updateBookingStatusAction } from '@/app/[slug]/admin/(protected)/dashboard/actions';
import { db } from '@/lib/db';
import { ensureAuthenticated } from '@/lib/auth';
import { sendBookingStatusChangeEmail } from '@/lib/email';

vi.mock('@/lib/db', () => ({
    db: {
        booking: {
            update: vi.fn(),
        },
    },
}));

vi.mock('@/lib/auth', () => ({
    ensureAuthenticated: vi.fn(),
}));

vi.mock('@/lib/email', () => ({
    sendBookingStatusChangeEmail: vi.fn().mockResolvedValue({ success: true }),
}));

vi.mock('next/cache', () => ({
    revalidatePath: vi.fn(),
}));

describe('booking status email notifications', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.mocked(ensureAuthenticated).mockResolvedValue({} as never);
        vi.mocked(db.booking.update).mockResolvedValue({
            id: 'booking-1',
            customerEmail: 'alice@example.com',
            customerName: 'Alice Rider',
            tenantSlug: 'trail-hub',
            startTime: new Date(),
            bookingCode: 'ABC12345',
        } as never);
    });

    it('sends a cancellation email when the tenant requests notification', async () => {
        const formData = new FormData();
        formData.append('bookingId', 'booking-1');
        formData.append('slug', 'trail-hub');
        formData.append('notifyUser', 'true');

        await cancelBookingAction(formData);

        expect(sendBookingStatusChangeEmail).toHaveBeenCalledWith(
            expect.objectContaining({ id: 'booking-1' }),
            'CANCELLED',
        );
    });

    it('sends a no-show email when notifyUser is true', async () => {
        await updateBookingStatusAction('booking-1', 'trail-hub', 'NO_SHOW', true);

        expect(sendBookingStatusChangeEmail).toHaveBeenCalledWith(
            expect.objectContaining({ id: 'booking-1' }),
            'NO_SHOW',
        );
    });
});
