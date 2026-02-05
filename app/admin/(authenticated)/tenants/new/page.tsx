"use client";

import { useActionState } from "react";
import { createTenantAction } from "../../actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const initialState = {
    error: "",
};

export default function NewTenantPage() {
    const [state, formAction, isPending] = useActionState(createTenantAction, initialState);

    return (
        <div className="max-w-2xl mx-auto bg-white p-8 shadow-sm border border-gray-100 rounded-2xl mt-8">
            <h1 className="text-2xl font-bold mb-6">Add New Tenant</h1>

            <form action={formAction} className="space-y-6">
                <div className="space-y-2">
                    <Label htmlFor="name">Display Name</Label>
                    <Input id="name" name="name" required placeholder="e.g. Paganella Bike Park" />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="slug">URL Slug</Label>
                    <div className="flex rounded-xl overflow-hidden shadow-sm border border-gray-200 focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2">
                        <span className="inline-flex items-center px-4 bg-gray-50 text-gray-500 text-sm border-r border-gray-200">
                            mtbreserve.com/
                        </span>
                        <Input
                            id="slug"
                            name="slug"
                            required
                            className="flex-1 border-none focus-visible:ring-0 rounded-none h-11"
                            placeholder="paganella"
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="contactEmail">Public Contact Email</Label>
                    <Input id="contactEmail" name="contactEmail" type="email" required placeholder="contact@park.com" />
                    <p className="text-xs text-gray-500 italic">Visible to customers on the booking page.</p>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="registrationEmail">Admin Registration Email</Label>
                    <Input id="registrationEmail" name="registrationEmail" type="email" required placeholder="admin@park.com" />
                    <p className="text-xs text-gray-500 italic">Used for login, password resets, and admin notifications.</p>
                </div>

                {state?.error && (
                    <div className="text-red-600 text-sm bg-red-50 p-3 rounded-lg border border-red-100">
                        {state.error}
                    </div>
                )}

                <Button
                    type="submit"
                    disabled={isPending}
                    className="w-full h-12 text-base font-semibold"
                >
                    {isPending ? "Creating..." : "Create Tenant"}
                </Button>
            </form>
        </div>
    );
}
