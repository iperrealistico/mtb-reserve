"use client";

import { requestPasswordResetAction } from "./actions";
import ReCAPTCHA from "react-google-recaptcha";
import { useState } from "react";

export default function ForgotPasswordForm({ slug }: { slug: string }) {
    const [captchaToken, setCaptchaToken] = useState<string | null>(null);

    return (
        <form action={requestPasswordResetAction} className="space-y-6">
            <input type="hidden" name="slug" value={slug} />
            <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    Admin Email Address
                </label>
                <div className="mt-1">
                    <input
                        id="email"
                        name="email"
                        type="email"
                        autoComplete="email"
                        required
                        className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-black focus:border-black sm:text-sm"
                    />
                </div>
            </div>

            <div className="flex justify-center my-4 overflow-hidden max-w-full">
                <ReCAPTCHA
                    sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || "6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI"}
                    onChange={(val) => setCaptchaToken(val)}
                />
            </div>
            <input type="hidden" name="recaptchaToken" value={captchaToken || ""} />

            <div>
                <button
                    type="submit"
                    disabled={!captchaToken}
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Send Reset Link
                </button>
            </div>
        </form>
    );
}
