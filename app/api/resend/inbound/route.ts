import { ingestMailboxEmail } from "@/lib/mailbox";
import { NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY || "re_mock_key");

export async function POST(request: Request) {
    const webhookSecret = process.env.RESEND_WEBHOOK_SECRET;

    if (!webhookSecret) {
        return NextResponse.json({ error: "Webhook secret not configured" }, { status: 503 });
    }

    const payload = await request.text();

    try {
        const event = resend.webhooks.verify({
            payload,
            webhookSecret,
            headers: {
                id: request.headers.get("svix-id") || "",
                timestamp: request.headers.get("svix-timestamp") || "",
                signature: request.headers.get("svix-signature") || "",
            },
        });

        if (event.type !== "email.received") {
            return NextResponse.json({ ok: true, ignored: true });
        }

        await ingestMailboxEmail(event.data as {
            email_id: string;
            from: string;
            to: string[];
            subject?: string | null;
            message_id?: string | null;
        });

        return NextResponse.json({ ok: true });
    } catch (error) {
        console.error("Invalid Resend inbound webhook", error);
        return NextResponse.json({ error: "Invalid webhook" }, { status: 400 });
    }
}
