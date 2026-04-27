"use server";

import { rateLimit } from "@/lib/rate-limit";
import { getRequestIp } from "@/lib/runtime";
import { verifyAltchaPayload } from "@/lib/altcha";
import {
    createOrganizerFromJoinRequest,
    JOIN_REQUEST_SUCCESS_MESSAGE,
} from "@/lib/signup";
import { z } from "zod";

const joinRequestSchema = z.object({
    firstName: z.string().trim().min(1).max(80),
    lastName: z.string().trim().min(1).max(80),
    organization: z.string().trim().min(2).max(120),
    address: z.string().trim().max(200).optional().or(z.literal("")),
    phone: z.string().trim().min(4).max(40),
    email: z.email().transform((value) => value.trim().toLowerCase()),
    message: z.string().trim().max(1000).optional().or(z.literal("")),
    altcha: z.string().min(20),
});

export async function submitJoinRequest(_prevState: unknown, formData: FormData) {
    const rawData = {
        firstName: formData.get("firstName") as string,
        lastName: formData.get("lastName") as string,
        organization: formData.get("organization") as string,
        address: formData.get("address") as string,
        phone: formData.get("phone") as string,
        email: formData.get("email") as string,
        message: formData.get("message") as string,
        altcha: formData.get("altcha") as string,
    };

    const parsed = joinRequestSchema.safeParse(rawData);
    if (!parsed.success) {
        return { success: false, error: "Please complete all required fields and the verification step." };
    }

    try {
        const ip = await getRequestIp();

        const ipLimit = await rateLimit(`join_request:ip:${ip}`, 5, 3600);
        if (!ipLimit.success) {
            return { success: false, error: "Too many requests from this connection. Please try again later." };
        }

        const emailLimit = await rateLimit(`join_request:email:${parsed.data.email}`, 3, 86400);
        if (!emailLimit.success) {
            return { success: false, error: "Too many requests for this email. Please try again later." };
        }

        const altchaResult = await verifyAltchaPayload(parsed.data.altcha);
        if (!altchaResult.verified) {
            return { success: false, error: "Verification failed. Please try again." };
        }

        const result = await createOrganizerFromJoinRequest(parsed.data);

        return {
            success: true,
            error: "",
            message: result.message || JOIN_REQUEST_SUCCESS_MESSAGE,
        };
    } catch (error) {
        console.error("Join request failed", error);
        return { success: false, error: "An unexpected error occurred." };
    }
}
