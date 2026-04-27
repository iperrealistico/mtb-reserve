import { createJoinRequestAltchaChallenge, isAltchaConfigured } from "@/lib/altcha";
import { NextResponse } from "next/server";

export async function GET() {
    if (!isAltchaConfigured()) {
        return NextResponse.json(
            { error: "ALTCHA is not configured" },
            { status: 503, headers: { "Cache-Control": "no-store" } },
        );
    }

    const challenge = await createJoinRequestAltchaChallenge();

    return NextResponse.json(challenge, {
        headers: {
            "Cache-Control": "no-store",
        },
    });
}
