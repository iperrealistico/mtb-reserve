import { beforeEach, describe, expect, it, vi } from 'vitest';
import { requestPasswordResetAction } from '@/app/[slug]/admin/forgot-password/actions';
import { db } from '@/lib/db';
import { sendPasswordResetTemplateEmail } from '@/lib/email';
import { getTenantBySlug, getTenantRouteSlug } from '@/lib/tenants';
import { redirect } from 'next/navigation';

vi.mock('@/lib/db', () => ({
    db: {
        tenant: {
            update: vi.fn(),
        },
    },
}));

vi.mock('@/lib/email', () => ({
    sendPasswordResetTemplateEmail: vi.fn().mockResolvedValue({ success: true }),
}));

vi.mock('@/lib/rate-limit', () => ({
    rateLimit: vi.fn().mockResolvedValue({ success: true, limit: 3, remaining: 2, reset: new Date() }),
}));

vi.mock('@/lib/tenants', () => ({
    getTenantBySlug: vi.fn(),
    getTenantRouteSlug: vi.fn(),
}));

describe('requestPasswordResetAction', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.mocked(getTenantBySlug).mockResolvedValue({
            slug: 'trail-hub',
            name: 'Trail Hub',
            registrationEmail: 'owner@trailhub.test',
        } as never);
        vi.mocked(getTenantRouteSlug).mockReturnValue('trail-hub');
    });

    it('sends the password reset template when the registration email matches', async () => {
        const formData = new FormData();
        formData.append('slug', 'trail-hub');
        formData.append('email', 'owner@trailhub.test');

        await requestPasswordResetAction(formData);

        expect(db.tenant.update).toHaveBeenCalled();
        expect(sendPasswordResetTemplateEmail).toHaveBeenCalledWith(
            expect.objectContaining({
                to: 'owner@trailhub.test',
                tenantName: 'Trail Hub',
                entityId: 'trail-hub',
            }),
        );
        expect(vi.mocked(sendPasswordResetTemplateEmail).mock.calls[0]?.[0].link).toContain(
            '/trail-hub/admin/reset-password?token=',
        );
        expect(redirect).toHaveBeenCalledWith('/trail-hub/admin/forgot-password/sent');
    });
});
