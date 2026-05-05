import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createOrganizerFromJoinRequest } from '@/lib/signup';
import { db } from '@/lib/db';
import { sendSignupRequestAdminNotification, sendTenantOnboardingEmail } from '@/lib/email';
import { generateUniqueTenantPublicSlug, getTenantRouteSlug } from '@/lib/tenants';

vi.mock('@/lib/auth', () => ({
    generateSecureItalianPassword: vi.fn(() => 'secure-pass-1234'),
    hashPassword: vi.fn().mockResolvedValue('hashed-password'),
}));

vi.mock('@/lib/db', () => ({
    db: {
        signupRequest: {
            create: vi.fn(),
            update: vi.fn(),
        },
        tenant: {
            findFirst: vi.fn(),
            create: vi.fn(),
            update: vi.fn(),
        },
    },
}));

vi.mock('@/lib/email', () => ({
    sendSignupRequestAdminNotification: vi.fn().mockResolvedValue({ success: true }),
    sendTenantOnboardingEmail: vi.fn().mockResolvedValue({ success: true }),
}));

vi.mock('@/lib/runtime', () => ({
    getBaseUrl: vi.fn(() => 'https://www.mtbreserve.com'),
}));

vi.mock('@/lib/tenants', () => ({
    generateUniqueTenantPublicSlug: vi.fn(),
    getTenantRouteSlug: vi.fn(),
}));

describe('createOrganizerFromJoinRequest', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.mocked(db.signupRequest.create).mockResolvedValue({ id: 'request-1' } as never);
        vi.mocked(db.tenant.findFirst).mockResolvedValue(null);
        vi.mocked(generateUniqueTenantPublicSlug).mockResolvedValue('trail-hub');
        vi.mocked(db.tenant.create).mockResolvedValue({
            slug: 'trail-hub',
            publicSlug: 'trail-hub',
            name: 'Trail Hub',
            registrationEmail: 'owner@trailhub.test',
        } as never);
        vi.mocked(getTenantRouteSlug).mockReturnValue('trail-hub');
        vi.mocked(db.signupRequest.update).mockResolvedValue({} as never);
    });

    it('provisions the organizer and sends onboarding plus admin notification emails', async () => {
        const result = await createOrganizerFromJoinRequest({
            firstName: 'Alice',
            lastName: 'Rider',
            organization: 'Trail Hub',
            email: 'owner@trailhub.test',
            phone: '+39 333 0000000',
            message: 'We have 20 bikes.',
        });

        expect(result.success).toBe(true);
        expect(sendTenantOnboardingEmail).toHaveBeenCalledWith({
            name: 'Trail Hub',
            registrationEmail: 'owner@trailhub.test',
            password: 'secure-pass-1234',
            routeSlug: 'trail-hub',
        });
        expect(sendSignupRequestAdminNotification).toHaveBeenCalledWith(
            expect.objectContaining({
                organization: 'Trail Hub',
                email: 'owner@trailhub.test',
            }),
            expect.objectContaining({
                publicSlug: 'trail-hub',
                loginUrl: 'https://www.mtbreserve.com/trail-hub/admin/login',
            }),
        );
        expect(db.signupRequest.update).toHaveBeenCalledWith(
            expect.objectContaining({
                where: { id: 'request-1' },
                data: expect.objectContaining({
                    provisioningStatus: 'PROVISIONED',
                    tenantSlug: 'trail-hub',
                }),
            }),
        );
    });
});
