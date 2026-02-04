import { describe, it, expect } from 'vitest';
import { getComputedSlots } from '@/lib/tenants';

describe('getComputedSlots', () => {
    it('should add full-day slot when enabled', () => {
        const tenant = {
            settings: {
                slots: [
                    { id: 'm', label: 'M', start: '09:00', end: '12:00' },
                    { id: 'a', label: 'A', start: '14:00', end: '18:00' },
                ],
                fullDayEnabled: true,
            }
        };
        const slots = getComputedSlots(tenant);
        const fullDay = slots.find(s => s.id === 'full-day');
        expect(fullDay).toBeDefined();
        expect(fullDay?.start).toBe('09:00');
        expect(fullDay?.end).toBe('18:00');
    });

    it('should NOT add full-day slot when disabled', () => {
        const tenant = {
            settings: {
                slots: [{ id: 'm', label: 'M', start: '09:00', end: '12:00' }],
                fullDayEnabled: false,
            }
        };
        const slots = getComputedSlots(tenant);
        expect(slots.find(s => s.id === 'full-day')).toBeUndefined();
    });
});
