"use client";

import { useActionState, useState } from "react";
import { sendTenantEmailAction } from "../../actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail } from "lucide-react";

export default function TenantEmailer({ slug, adminEmail }: { slug: string, adminEmail: string }) {
    const [open, setOpen] = useState(false);
    const [state, formAction, isPending] = useActionState(sendTenantEmailAction, { success: false, error: "" });

    return (
        <div className="bg-white p-6 shadow rounded-lg">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium">Send Email to Admin</h3>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setOpen(!open)}
                >
                    {open ? "Cancel" : "Compose"}
                </Button>
            </div>

            {open && (
                <form action={formAction} className="space-y-4">
                    <input type="hidden" name="slug" value={slug} />
                    <input type="hidden" name="to" value={adminEmail} />

                    <div className="space-y-2">
                        <Label htmlFor="subject">Subject</Label>
                        <Input id="subject" name="subject" required />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="body">Message</Label>
                        <textarea
                            id="body"
                            name="body"
                            rows={4}
                            required
                            className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                        />
                    </div>

                    {state.success && <p className="text-green-600 text-sm">Email sent successfully</p>}
                    {state.error && <p className="text-red-600 text-sm">{state.error}</p>}

                    <Button type="submit" disabled={isPending}>
                        <Mail className="w-4 h-4 mr-2" />
                        {isPending ? "Sending..." : "Send Email"}
                    </Button>
                </form>
            )}
        </div>
    );
}
