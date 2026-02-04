"use client";

import { useFormState } from "react-dom";
import { loginAction } from "./actions";
import { useSearchParams } from "next/navigation";
import ReCAPTCHA from "react-google-recaptcha";
import { useState } from "react";

// Define the initial state based on the action's return type
const initialState = {
    error: "",
};

export default function LoginForm({ slug }: { slug: string }) {
    const [state, formAction] = useFormState(loginAction, initialState);
    const searchParams = useSearchParams();
    const [captchaToken, setCaptchaToken] = useState<string | null>(null);
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
                        <input
                            id="password"
                            name="password"
                            type="password"
                            autoComplete="current-password"
                            required
                            className="appearance-none relative block w-full px-3 py-4 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-black focus:border-black focus:z-10 sm:text-lg"
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

                <div className="flex justify-center my-4 overflow-hidden max-w-full">
                    <ReCAPTCHA
                        sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || "6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI"} // Test key
                        onChange={(val) => setCaptchaToken(val)}
                    />
                </div>
                <input type="hidden" name="recaptchaToken" value={captchaToken || ""} />

                <div>
                    <button
                        type="submit"
                        disabled={!captchaToken}
                        className="group relative w-full flex justify-center py-4 px-4 border border-transparent text-lg font-medium rounded-md text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Sign in
                    </button>
                </div>
            </form>
        </div>
    );
}
