"use client";

import { useActionState } from "react";
import { updateTenantDetailsAction } from "../../actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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

            <div className="space-y-2">
                <Label htmlFor="name">Tenant Name</Label>
                <Input id="name" name="name" defaultValue={initialName} />
            </div>

            <div className="space-y-2">
                <Label htmlFor="contactEmail">Contact Email</Label>
                <Input id="contactEmail" name="contactEmail" type="email" defaultValue={initialEmail} />
            </div>

            {state.success && <div className="text-green-600 text-sm">Updated successfully</div>}
            {state.error && <div className="text-red-600 text-sm">{state.error}</div>}

            <Button type="submit" disabled={isPending}>
                {isPending ? "Updating..." : "Update Details"}
            </Button>
        </form>
    );
}
