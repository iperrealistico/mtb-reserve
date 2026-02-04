"use client";

import { useActionState, useState } from "react";
import { resetTenantPasswordAdminAction } from "../../actions";

export default function TenantPasswordReset({ slug }: { slug: string }) {
    const [state, formAction, isPending] = useActionState(resetTenantPasswordAdminAction, { success: false, error: "" });
    const [confirm, setConfirm] = useState(false);

    return (
        <div className="bg-white p-6 shadow rounded-lg border mt-6 border-yellow-200">
            <h3 className="text-lg font-medium text-yellow-800">Security & Access</h3>
            <p className="text-sm text-yellow-700 mb-4">
                Force reset the tenant admin password. This will invalidate their current session.
            </p>

            {state.success && (
                <div className="mb-4 bg-green-50 border border-green-200 p-4 rounded">
                    <p className="font-bold text-lg text-green-700">Password Reset Successful!</p>
                    <p className="text-sm text-gray-700 mt-2">
                        A new secure password has been generated and emailed to the tenant's contact email.
                    </p>
                </div>
            )}

            {!confirm && !state.success && (
                <button
                    onClick={() => setConfirm(true)}
                    className="bg-yellow-100 text-yellow-800 border border-yellow-300 px-4 py-2 rounded hover:bg-yellow-200"
                >
                    Reset Password
                </button>
            )}

            {confirm && !state.success && (
                <form action={formAction} className="flex gap-4 items-center">
                    <input type="hidden" name="slug" value={slug} />
                    <button type="submit" disabled={isPending} className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 disabled:opacity-50">
                        {isPending ? "Resetting..." : "Confirm Reset"}
                    </button>
                    <button type="button" onClick={() => setConfirm(false)} className="text-sm text-gray-600 underline">
                        Cancel
                    </button>
                </form>
            )}
        </div>
    );
}
