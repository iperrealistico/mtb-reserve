"use client";

import { requestPasswordResetAction } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function ForgotPasswordForm({ slug }: { slug: string }) {
    // Removed captcha state/refs

    return (
        <form action={requestPasswordResetAction} className="space-y-6">
            <input type="hidden" name="slug" value={slug} />
            <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    Admin Email Address
                </label>
                <div className="mt-1">
                    <Input
                        id="email"
                        name="email"
                        type="email"
                        autoComplete="email"
                        required
                        className="block w-full h-12"
                    />
                </div>
            </div>

            {/* Removed ReCAPTCHA container */}

            <div>
                <Button
                    type="submit"
                    className="w-full text-lg h-12"
                >
                    Send Reset Link
                </Button>
            </div>
        </form>
    );
}
