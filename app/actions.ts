"use server";

import { sendSignupRequest } from "@/lib/email";
import { db } from "@/lib/db";

export async function submitJoinRequest(_prevState: unknown, formData: FormData) {
    const rawData = {
        firstName: formData.get("firstName") as string,
        lastName: formData.get("lastName") as string,
        organization: formData.get("organization") as string,
        address: formData.get("address") as string,
        phone: formData.get("phone") as string,
        email: formData.get("email") as string,
        message: formData.get("message") as string,
    };

    // Validation
    const required = ["firstName", "lastName", "organization", "phone", "email"];
    for (const field of required) {
        if (!rawData[field as keyof typeof rawData]) {
            return { success: false, error: "Please fill in all required fields." };
        }
    }

    try {
        // 1. Save to Database
        await (db as any).signupRequest.create({
            data: rawData
        });

        // 2. Send Emails
        await sendSignupRequest(rawData);

        return { success: true };
    } catch (error) {
        console.error("Join request failed", error);
        return { success: false, error: "An unexpected error occurred." };
    }
}
