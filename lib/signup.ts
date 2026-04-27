import { generateSecureItalianPassword, hashPassword } from "@/lib/auth";
import { db } from "@/lib/db";
import {
    sendSignupRequestAdminNotification,
    sendTenantOnboardingEmail,
} from "@/lib/email";
import { logEvent } from "@/lib/events";
import { getBaseUrl } from "@/lib/runtime";
import {
    generateUniqueTenantPublicSlug,
    getTenantRouteSlug,
} from "@/lib/tenants";

export type JoinRequestInput = {
    firstName: string;
    lastName: string;
    organization: string;
    address?: string;
    phone: string;
    email: string;
    message?: string;
};

export const JOIN_REQUEST_SUCCESS_MESSAGE =
    "If everything looks good, access will arrive by email shortly.";

function cleanOptional(value?: string | null) {
    const trimmed = value?.trim();
    return trimmed ? trimmed : null;
}

function getEmailErrorMessage(error: unknown) {
    if (error instanceof Error) {
        return error.message;
    }

    return "Unable to send onboarding email";
}

export async function createOrganizerFromJoinRequest(input: JoinRequestInput) {
    const payload = {
        firstName: input.firstName.trim(),
        lastName: input.lastName.trim(),
        organization: input.organization.trim(),
        email: input.email.trim().toLowerCase(),
        phone: input.phone.trim(),
        address: cleanOptional(input.address),
        message: cleanOptional(input.message),
    };

    const request = await db.signupRequest.create({
        data: payload,
    });

    const existingTenant = await db.tenant.findFirst({
        where: {
            OR: [
                { registrationEmail: { equals: payload.email, mode: "insensitive" } },
                { contactEmail: { equals: payload.email, mode: "insensitive" } },
            ],
        },
        select: {
            slug: true,
            publicSlug: true,
            name: true,
        },
    });

    if (existingTenant) {
        const routeSlug = getTenantRouteSlug(existingTenant);
        const loginUrl = `${getBaseUrl()}/${routeSlug}/admin/login`;

        await db.signupRequest.update({
            where: { id: request.id },
            data: {
                tenantSlug: existingTenant.slug,
                provisioningStatus: "DUPLICATE",
                failureReason: "A tenant already exists for this email address.",
                status: "REPLIED",
            },
        });

        await sendSignupRequestAdminNotification(payload, {
            duplicate: true,
            publicSlug: routeSlug,
            loginUrl,
        });

        await logEvent({
            level: "INFO",
            actorType: "SYSTEM",
            tenantId: existingTenant.slug,
            eventType: "JOIN_REQUEST_DUPLICATE",
            message: "Join request matched an existing organizer email",
            entityType: "SignupRequest",
            entityId: request.id,
            metadata: { email: payload.email, organization: payload.organization },
        });

        return {
            success: true as const,
            message: JOIN_REQUEST_SUCCESS_MESSAGE,
            requestId: request.id,
            duplicate: true,
        };
    }

    const initialSlug = await generateUniqueTenantPublicSlug(payload.organization);
    const password = generateSecureItalianPassword();
    const passwordHash = await hashPassword(password);

    const tenant = await db.tenant.create({
        data: {
            slug: initialSlug,
            publicSlug: initialSlug,
            isPublished: false,
            publishedAt: null,
            name: payload.organization,
            adminPasswordHash: passwordHash,
            contactEmail: payload.email,
            registrationEmail: payload.email,
            contactPhone: payload.phone,
            address: payload.address,
            timezone: "Europe/Rome",
            settings: {},
        },
    });

    const routeSlug = getTenantRouteSlug(tenant);
    const loginUrl = `${getBaseUrl()}/${routeSlug}/admin/login`;

    const onboardingResult = await sendTenantOnboardingEmail({
        name: tenant.name,
        registrationEmail: tenant.registrationEmail,
        password,
        routeSlug,
    });

    if (onboardingResult.error) {
        const failureReason = getEmailErrorMessage(onboardingResult.error);

        await db.signupRequest.update({
            where: { id: request.id },
            data: {
                tenantSlug: tenant.slug,
                provisioningStatus: "EMAIL_FAILED",
                failureReason,
            },
        });

        await sendSignupRequestAdminNotification(payload, {
            publicSlug: routeSlug,
            loginUrl,
        });

        await logEvent({
            level: "ERROR",
            actorType: "SYSTEM",
            tenantId: tenant.slug,
            eventType: "JOIN_REQUEST_EMAIL_FAILED",
            message: "Organizer created but onboarding email failed",
            entityType: "SignupRequest",
            entityId: request.id,
            metadata: { email: payload.email, failureReason },
        });

        return {
            success: true as const,
            message: JOIN_REQUEST_SUCCESS_MESSAGE,
            requestId: request.id,
            tenantSlug: tenant.slug,
            routeSlug,
        };
    }

    await db.signupRequest.update({
        where: { id: request.id },
        data: {
            tenantSlug: tenant.slug,
            provisioningStatus: "PROVISIONED",
            failureReason: null,
            provisionedAt: new Date(),
            status: "REPLIED",
        },
    });

    await sendSignupRequestAdminNotification(payload, {
        publicSlug: routeSlug,
        loginUrl,
    });

    await logEvent({
        level: "INFO",
        actorType: "SYSTEM",
        tenantId: tenant.slug,
        eventType: "JOIN_REQUEST_PROVISIONED",
        message: "Organizer provisioned automatically from join request",
        entityType: "SignupRequest",
        entityId: request.id,
        metadata: { email: payload.email, routeSlug },
    });

    return {
        success: true as const,
        message: JOIN_REQUEST_SUCCESS_MESSAGE,
        requestId: request.id,
        tenantSlug: tenant.slug,
        routeSlug,
    };
}

export async function resendOrganizerAccess(signupRequestId: string) {
    const request = await db.signupRequest.findUnique({
        where: { id: signupRequestId },
        include: {
            tenant: true,
        },
    });

    if (!request?.tenant) {
        throw new Error("No organizer account is linked to this application yet.");
    }

    const password = generateSecureItalianPassword();
    const passwordHash = await hashPassword(password);

    const tenant = await db.tenant.update({
        where: { slug: request.tenant.slug },
        data: {
            adminPasswordHash: passwordHash,
            tokenVersion: { increment: 1 },
        },
    });

    const routeSlug = getTenantRouteSlug(tenant);
    const emailResult = await sendTenantOnboardingEmail({
        name: tenant.name,
        registrationEmail: tenant.registrationEmail,
        password,
        routeSlug,
    });

    if (emailResult.error) {
        const failureReason = getEmailErrorMessage(emailResult.error);

        await db.signupRequest.update({
            where: { id: request.id },
            data: {
                provisioningStatus: "EMAIL_FAILED",
                failureReason,
            },
        });

        throw new Error(failureReason);
    }

    await db.signupRequest.update({
        where: { id: request.id },
        data: {
            provisioningStatus: "PROVISIONED",
            provisionedAt: new Date(),
            failureReason: null,
            status: "REPLIED",
        },
    });

    await logEvent({
        level: "INFO",
        actorType: "SUPER_ADMIN",
        tenantId: tenant.slug,
        eventType: "JOIN_REQUEST_ACCESS_RESENT",
        message: "Organizer access resent from super admin console",
        entityType: "SignupRequest",
        entityId: request.id,
        metadata: { routeSlug },
    });
}
