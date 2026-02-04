"use client";

import { useActionState, useEffect } from "react";
import { resetPasswordAction } from "./actions";

interface ResetFormProps {
    slug: string;
    token: string;
}

const initialState = {
    error: "",
    success: false,
    newPassword: "",
};

export default function ResetForm({ slug, token }: ResetFormProps) {
    const [state, formAction, isPending] = useActionState(resetPasswordAction, initialState);

    return (
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
            {state?.success ? (
                <div className="text-center">
                    <div className="mb-6">
                        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
                            <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <h3 className="mt-2 text-lg font-medium text-gray-900">Password Reset Successful!</h3>
                    </div>

                    <div className="bg-gray-50 border border-gray-200 rounded-md p-4 mb-6">
                        <p className="text-sm text-gray-500 mb-2">
                            A new secure password has been generated.
                        </p>
                        <p className="text-lg font-medium text-gray-900">
                            Check your email inbox.
                        </p>
                        <p className="text-xs text-gray-500 mt-2">
                            It may take a minute to arrive. Check your spam folder if necessary.
                        </p>
                    </div>

                    <div>
                        <a
                            href={`/${slug}/admin/login`}
                            className="w-full inline-flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-black hover:bg-gray-800 focus:outline-none"
                        >
                            Go to Login
                        </a>
                    </div>
                </div>
            ) : (
                <form action={formAction} className="space-y-6">
                    <input type="hidden" name="slug" value={slug} />
                    <input type="hidden" name="token" value={token} />

                    <div className="text-center mb-6">
                        <p className="text-sm text-gray-600">
                            Click the button below to generate a new secure password.
                        </p>
                    </div>

                    {state?.error && (
                        <div className="rounded-md bg-red-50 p-4">
                            <div className="flex">
                                <div className="ml-3">
                                    <h3 className="text-sm font-medium text-red-800">
                                        Error
                                    </h3>
                                    <div className="mt-2 text-sm text-red-700">
                                        <p>{state.error}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    <div>
                        <button
                            type="submit"
                            disabled={isPending}
                            className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black ${isPending ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            {isPending ? "Generating..." : "Generate New Password"}
                        </button>
                    </div>
                </form>
            )}
        </div>
    );
}
