"use client";

import { useFormState } from "react-dom";
import { loginAction } from "./actions";
import { useSearchParams } from "next/navigation";
import ReCAPTCHA from "react-google-recaptcha";
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// Define the initial state based on the action's return type
const initialState = {
    error: "",
};

export default function LoginForm({ slug }: { slug: string }) {
    const [state, formAction] = useFormState(loginAction, initialState);
    const searchParams = useSearchParams();
    const [captchaToken, setCaptchaToken] = useState<string | null>(null);
    const [isVerifying, setIsVerifying] = useState(false);
    const recaptchaRef = useRef<ReCAPTCHA>(null);
    const formRef = useRef<HTMLFormElement>(null);
    const error = state?.error;

    const handleLoginClick = (e: React.MouseEvent) => {
        // Prevent default form submission if no token
        if (!captchaToken) {
            e.preventDefault();
            setIsVerifying(true);
            recaptchaRef.current?.execute();

            // Timeout Guard
            setTimeout(() => {
                if (!captchaToken && isVerifying) {
                    setIsVerifying(false);
                    // toast.error not available here easily? It's a client component, use sonner if available or just reset
                    console.warn("Login captcha timeout");
                }
            }, 5000);
        }
    };

    const onCaptchaChange = (token: string | null) => {
        if (token) {
            setCaptchaToken(token);
            // Trigger form submission now that we have token
            // We need to wait for state update? 
            // In React 18 auto-batching might handle it, but to be safe we can force it or let effect handle it?
            // Actually requestSubmit() will grab current hidden input value if render happened.
            // But state update is async. 
            // Better to trigger submission in an effect or use a ref for the token too?
        }
    };

    // Effect to auto-submit when token is set and we were verifying
    useEffect(() => {
        if (captchaToken && isVerifying && formRef.current) {
            formRef.current.requestSubmit();
        }
    }, [captchaToken, isVerifying]);

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

            <form ref={formRef} action={formAction} className="mt-8 space-y-6">
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

                <div className="absolute bottom-4 right-4 z-50">
                    <ReCAPTCHA
                        ref={recaptchaRef}
                        size="invisible"
                        sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || "6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI"}
                        onChange={onCaptchaChange}
                        onError={() => setIsVerifying(false)}
                    />
                </div>
                <input type="hidden" name="recaptchaToken" value={captchaToken || ""} />

                <div>
                    <Button
                        type="submit"
                        disabled={isVerifying}
                        isLoading={isVerifying}
                        className="w-full text-lg h-14"
                        onClick={handleLoginClick}
                    >
                        Sign in
                    </Button>
                </div>
            </form>
        </div>
    );
}
