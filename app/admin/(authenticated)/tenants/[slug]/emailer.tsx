"use client";

import { useActionState, useState } from "react";
import { sendTenantEmailAction } from "../../actions";

export default function TenantEmailer({ slug, adminEmail }: { slug: string, adminEmail: string }) {
    const [open, setOpen] = useState(false);
    const [state, formAction, isPending] = useActionState(sendTenantEmailAction, { success: false, error: "" });

    return (
        <div className="bg-white p-6 shadow rounded-lg border mt-6">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium">Send Email to Admin</h3>
                <button
                    onClick={() => setOpen(!open)}
                    className="text-sm text-indigo-600 hover:text-indigo-900"
                >
                    {open ? "Cancel" : "Compose"}
                </button>
            </div>

            {open && (
                <form action={formAction} className="space-y-4">
                    <input type="hidden" name="slug" value={slug} />
                    <input type="hidden" name="to" value={adminEmail} />

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Subject</label>
                        <input name="subject" required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Message</label>
                        <textarea name="body" rows={4} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
                    </div>

                    {state.success && <p className="text-green-600 text-sm">Email sent successfully!</p>}
                    {state.error && <p className="text-red-600 text-sm">{state.error}</p>}

                    <div className="pt-2">
                        <button type="submit" disabled={isPending} className="bg-indigo-600 text-white px-4 py-2 rounded shadow hover:bg-indigo-700 disabled:opacity-50">
                            {isPending ? "Sending..." : "Send Email"}
                        </button>
                    </div>
                </form>
            )}
        </div>
    );
}
