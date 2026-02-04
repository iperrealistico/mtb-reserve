import { describe, it, expect, vi, beforeEach } from 'vitest';
import { updateBikeTypeAction } from '@/app/[slug]/admin/(protected)/inventory/actions';
import { db } from '@/lib/db';
import { ensureAuthenticated } from '@/lib/auth';

vi.mock('@/lib/db', () => ({
    db: {
        bikeType: {
            update: vi.fn(),
        },
    },
}));

vi.mock('@/lib/auth', () => ({
    getSession: vi.fn(),
    ensureAuthenticated: vi.fn(),
}));

vi.mock('next/cache', () => ({
    revalidatePath: vi.fn(),
}));

describe('Inventory Actions Auth', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should NOT allow updating inventory without a session', async () => {
        // GIVEN: ensureAuthenticated throws Unauthorized
        (ensureAuthenticated as any).mockRejectedValue(new Error('Unauthorized'));

        const formData = new FormData();
        formData.append('id', 'bike-1');
        formData.append('slug', 'test-tenant');
        formData.append('totalStock', '5');
        formData.append('brokenCount', '0');

        // EXPECTED: It should throw an error
        await expect(updateBikeTypeAction(formData)).rejects.toThrow('Unauthorized');

        // AND: DB update should NOT have been called
        expect(db.bikeType.update).not.toHaveBeenCalled();
    });
});
