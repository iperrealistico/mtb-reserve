"use client";

import { useActionState } from "react";
import { updateTenantDetailsAction } from "../../actions";

export default function TenantDetailForm({
    slug,
    initialName,
    initialEmail
}: {
    slug: string,
    initialName: string,
    initialEmail: string
}) {
    const [state, formAction, isPending] = useActionState(updateTenantDetailsAction, { success: false, error: "" });

    return (
        <form action={formAction} className="space-y-4 max-w-lg">
            <input type="hidden" name="slug" value={slug} />

            <div>
                <label className="block text-sm font-medium text-gray-700">Tenant Name</label>
                <input name="name" defaultValue={initialName} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700">Contact Email</label>
                <input name="contactEmail" defaultValue={initialEmail} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
            </div>

            {state.success && <div className="text-green-600 text-sm">Updated!</div>}
            {state.error && <div className="text-red-600 text-sm">{state.error}</div>}

            <button type="submit" disabled={isPending} className="bg-indigo-600 text-white px-4 py-2 rounded shadow hover:bg-indigo-700 disabled:opacity-50">
                {isPending ? "Updating..." : "Update Details"}
            </button>
        </form>
    );
}
