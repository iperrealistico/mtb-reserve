"use client";

import { useActionState } from "react";
import { createTenantAction } from "../../actions"; // We'll create a shared actions file or put it here.
// Let's create app/admin/(authenticated)/actions.ts for shared admin actions.

const initialState = {
    error: "",
};

export default function NewTenantPage() {
    const [state, formAction, isPending] = useActionState(createTenantAction, initialState);

    return (
        <div className="max-w-2xl mx-auto bg-white p-8 shadow rounded-lg">
            <h1 className="text-2xl font-bold mb-6">Add New Tenant</h1>

            <form action={formAction} className="space-y-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Display Name</label>
                    <input name="name" required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-3" placeholder="e.g. Paganella Bike Park" />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">URL Slug</label>
                    <div className="mt-1 flex rounded-md shadow-sm">
                        <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                            website.com/
                        </span>
                        <input name="slug" required className="flex-1 block w-full min-w-0 border border-gray-300 rounded-none rounded-r-md p-3" placeholder="paganella" />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Admin Contact Email</label>
                    <input name="contactEmail" type="email" required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-3" />
                </div>

                {state?.error && (
                    <div className="text-red-600 text-sm bg-red-50 p-2 rounded">
                        {state.error}
                    </div>
                )}

                <button
                    type="submit"
                    disabled={isPending}
                    className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                    {isPending ? "Creating..." : "Create Tenant"}
                </button>
            </form>
        </div>
    );
}
