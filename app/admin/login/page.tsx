"use client";

import { useActionState } from "react";
import { superAdminLoginAction } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const initialState = {
    error: "",
};

export default function SuperAdminLoginPage() {
    const [state, formAction, isPending] = useActionState(superAdminLoginAction, initialState);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-lg border border-gray-200">
                <div className="text-center">
                    <h2 className="text-3xl font-bold tracking-tight text-gray-900">
                        Super Admin
                    </h2>
                    <p className="mt-2 text-sm text-gray-600">
                        Restricted Access
                    </p>
                </div>
                <form className="mt-8 space-y-6" action={formAction}>
                    <div className="rounded-md shadow-sm">
                        <div className="space-y-2">
                            <label htmlFor="password" className="sr-only">
                                Password
                            </label>
                            <Input
                                id="password"
                                name="password"
                                type="password"
                                autoComplete="current-password"
                                required
                                className="block w-full text-lg h-14"
                                placeholder="Enter secure password"
                            />
                        </div>
                    </div>

                    {state?.error && (
                        <div className="text-red-500 text-sm text-center bg-red-50 p-2 rounded-lg">
                            {state.error}
                        </div>
                    )}

                    <div>
                        <Button
                            type="submit"
                            disabled={isPending}
                            isLoading={isPending}
                            className="w-full text-lg h-14"
                        >
                            Sign in
                        </Button>
                    </div>
                </form>

                <div className="text-center text-xs text-gray-400">
                    <p>Protected System</p>
                </div>
            </div>
        </div>
    );
}
