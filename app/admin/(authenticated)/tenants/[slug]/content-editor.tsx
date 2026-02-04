"use client";

import { useActionState, useState } from "react";
import { updateTenantContentAction } from "../../actions"; // Shared action
import { TenantSettings } from "@/lib/tenants";

export default function TenantContentEditor({
    slug,
    initialSettings
}: {
    slug: string,
    initialSettings: TenantSettings
}) {
    const [open, setOpen] = useState(false);

    // Flatten settings for form
    const content = initialSettings.content || {};

    const [state, formAction, isPending] = useActionState(updateTenantContentAction, { success: false, error: "" });

    return (
        <div className="bg-white p-6 shadow rounded-lg border mt-6">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium">Content Customization</h3>
                <button
                    onClick={() => setOpen(!open)}
                    className="text-sm text-indigo-600 hover:text-indigo-900"
                >
                    {open ? "Hide" : "Edit Content"}
                </button>
            </div>

            {state.success && <div className="mb-4 text-green-600 border px-2 py-1 bg-green-50 rounded">Saved successfully!</div>}
            {state.error && <div className="mb-4 text-red-600 border px-2 py-1 bg-red-50 rounded">Error: {state.error}</div>}

            {open && (
                <form action={formAction} className="space-y-4">
                    <input type="hidden" name="slug" value={slug} />

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Booking Page Title</label>
                        <input name="bookingTitle" defaultValue={content.bookingTitle} placeholder="Default: Book your MTB" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Booking Page Subtitle</label>
                        <input name="bookingSubtitle" defaultValue={content.bookingSubtitle} placeholder="Default: Select a date..." className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Info Box (Public)</label>
                        <textarea name="infoBox" defaultValue={content.infoBox} rows={3} placeholder="Important info for customers..." className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Confirmation Email Subject</label>
                        <input name="emailSubjectConfirmation" defaultValue={content.emailSubjectConfirmation} placeholder="Default: Confirm your MTB Booking" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
                    </div>

                    <div className="pt-2">
                        <button type="submit" disabled={isPending} className="bg-gray-800 text-white px-4 py-2 rounded shadow hover:bg-black disabled:opacity-50">
                            {isPending ? "Saving..." : "Save Content Settings"}
                        </button>
                    </div>
                </form>
            )}
        </div>
    );
}
