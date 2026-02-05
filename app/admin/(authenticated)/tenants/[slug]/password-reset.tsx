"use client";

import { useActionState, useState } from "react";
import { resetTenantPasswordAdminAction } from "../../actions";
import { Button } from "@/components/ui/button";
import { Key } from "lucide-react";

export default function TenantPasswordReset({ slug }: { slug: string }) {
    const [state, formAction, isPending] = useActionState(resetTenantPasswordAdminAction, { success: false, error: "" });
    const [confirm, setConfirm] = useState(false);

    return (
        <div className="bg-white p-6 shadow rounded-lg border-yellow-200 border">
            <h3 className="text-lg font-medium text-yellow-800 mb-2">Security</h3>
            <p className="text-sm text-gray-600 mb-4">
                Force reset the tenant admin password. This will invalidate their current session and send a new password via email.
            </p>

            {state.success && (
                <div className="mb-4 bg-green-50 border border-green-200 p-4 rounded-lg">
                    <p className="font-medium text-green-700">Password Reset Successful</p>
                    <p className="text-sm text-gray-600 mt-1">
                        A new secure password has been generated and emailed to the tenant&apos;s contact email.
                    </p>
                </div>
            )}

            {!confirm && !state.success && (
                <Button
                    variant="outline"
                    onClick={() => setConfirm(true)}
                    className="border-yellow-300 text-yellow-800 hover:bg-yellow-50"
                >
                    <Key className="w-4 h-4 mr-2" />
                    Reset Password
                </Button>
            )}

            {confirm && !state.success && (
                <form action={formAction} className="flex gap-4 items-center">
                    <input type="hidden" name="slug" value={slug} />
                    <Button type="submit" variant="destructive" disabled={isPending}>
                        {isPending ? "Resetting..." : "Confirm Reset"}
                    </Button>
                    <Button type="button" variant="ghost" onClick={() => setConfirm(false)}>
                        Cancel
                    </Button>
                </form>
            )}
        </div>
    );
}
