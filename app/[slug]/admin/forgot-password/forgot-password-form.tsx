"use client";

import { requestPasswordResetAction } from "./actions";
import ReCAPTCHA from "react-google-recaptcha";
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function ForgotPasswordForm({ slug }: { slug: string }) {
    const [captchaToken, setCaptchaToken] = useState<string | null>(null);
    const [isVerifying, setIsVerifying] = useState(false);
    const recaptchaRef = useRef<ReCAPTCHA>(null);
    const formRef = useRef<HTMLFormElement>(null);

    const onCaptchaChange = (token: string | null) => {
        if (token) {
            setCaptchaToken(token);
            // Auto submit
        }
    };

    useEffect(() => {
        if (captchaToken && isVerifying && formRef.current) {
            formRef.current.requestSubmit();
        }
    }, [captchaToken, isVerifying]);

    const handleVerify = (e: React.MouseEvent) => {
        if (!captchaToken) {
            e.preventDefault();
            setIsVerifying(true);
            recaptchaRef.current?.execute();
        }
    };

    return (
        <form ref={formRef} action={requestPasswordResetAction} className="space-y-6">
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

            <div className="flex justify-center my-4 overflow-hidden max-w-full h-0">
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
                    className="w-full text-lg h-12"
                    onClick={handleVerify}
                >
                    Send Reset Link
                </Button>
            </div>
        </form>
    );
}
