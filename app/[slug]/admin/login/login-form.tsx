"use client";

import { useFormState } from "react-dom";
import { loginAction } from "./actions";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// Define the initial state based on the action's return type
const initialState = {
    error: "",
};

export default function LoginForm({ slug }: { slug: string }) {
    const [state, formAction] = useFormState(loginAction, initialState);
    const searchParams = useSearchParams();
    const error = state?.error;

    return (
        <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-lg border border-gray-200">
            <div className="text-center">
                <h2 className="text-3xl font-bold tracking-tight text-gray-900">
                    Admin Login
                </h2>
                <p className="mt-2 text-sm text-gray-600">
                    Enter your password to manage {slug}
                </p>
            </div>

            <form action={formAction} className="mt-8 space-y-6">
                <input type="hidden" name="slug" value={slug} />

                <div className="rounded-md shadow-sm -space-y-px">
                    <div>
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
                            placeholder="Enter your memorable password"
                        />
                    </div>
                </div>

                <div className="flex items-center justify-end mt-2">
                    <div className="text-sm">
                        <a href={`/${slug}/admin/forgot-password`} className="font-medium text-gray-500 hover:text-gray-900 underline">
                            Forgot your password?
                        </a>
                    </div>
                </div>

                {error && (
                    <div className="text-red-600 text-sm text-center font-medium bg-red-50 p-2 rounded">
                        {error}
                    </div>
                )}

                <div>
                    <Button
                        type="submit"
                        className="w-full text-lg h-14"
                    >
                        Sign in
                    </Button>
                </div>
            </form>
        </div>
    );
}
