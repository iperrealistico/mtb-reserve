import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getBikeAvailability } from '@/lib/availability';
import { db } from '@/lib/db';

vi.mock('@/lib/db', () => ({
    db: {
        bikeType: {
            findMany: vi.fn(),
        },
        booking: {
            count: vi.fn(),
            aggregate: vi.fn(),
        },
    },
}));

describe('getBikeAvailability', () => {
    const tenantSlug = 'test-tenant';
    const date = new Date('2025-01-01');
    const startTime = '09:00';
    const endTime = '13:00';

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should detect overbooking when quantity > 1', async () => {
        // GIVEN: 1 bike type with 2 stock
        (db.bikeType.findMany as any).mockResolvedValue([
            { id: 'bike-1', tenantSlug, name: 'Mountain Bike', totalStock: 2, brokenCount: 0 },
        ]);

        // GIVEN: 1 booking already exists with quantity 2
        (db.booking.aggregate as any).mockResolvedValue({
            _sum: { quantity: 2 },
        });

        const result = await getBikeAvailability(tenantSlug, date, startTime, endTime);

        // EXPECTED: 0 bikes available (2 stock - 2 quantity)
        expect(result['bike-1']).toBe(0);
    });
});
