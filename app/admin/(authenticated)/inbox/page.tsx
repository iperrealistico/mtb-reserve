import { db } from "@/lib/db";
import { InboxClient } from "./inbox-client";

export default async function InboxPage() {
    const requests = await (db as any).signupRequest.findMany({
        orderBy: { createdAt: "desc" }
    });

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold font-outfit">Inbox</h1>
            <p className="text-neutral-500">Manage incoming partnership requests.</p>
            <InboxClient requests={requests} />
        </div>
    );
}
