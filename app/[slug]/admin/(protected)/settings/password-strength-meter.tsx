"use client";

import { Check, X, Shield, ShieldAlert, ShieldCheck } from "lucide-react";

export interface PasswordRequirement {
    id: string;
    label: string;
    test: (password: string) => boolean;
}

export const REQUIREMENTS: PasswordRequirement[] = [
    { id: "length", label: "8-32 characters", test: (p) => p.length >= 8 && p.length <= 32 },
    { id: "uppercase", label: "At least one uppercase letter", test: (p) => /[A-Z]/.test(p) },
    { id: "number", label: "At least one number", test: (p) => /[0-9]/.test(p) },
    { id: "special", label: "At least one special character", test: (p) => /[!@#$%^&*(),.?":{}|<>]/.test(p) },
];

export function getStrength(password: string) {
    if (!password) return 0;
    const passed = REQUIREMENTS.filter(req => req.test(password)).length;
    return (passed / REQUIREMENTS.length) * 100;
}

export default function PasswordStrengthMeter({ password }: { password: string }) {
    const strength = getStrength(password);

    const getStrengthColor = () => {
        if (strength <= 25) return "bg-red-500";
        if (strength <= 50) return "bg-orange-500";
        if (strength <= 75) return "bg-yellow-500";
        return "bg-green-500";
    };

    const getStrengthText = () => {
        if (!password) return "Enter password";
        if (strength <= 25) return "Very Weak";
        if (strength <= 50) return "Weak";
        if (strength <= 75) return "Good";
        return "Strong";
    };

    const getStrengthIcon = () => {
        if (!password) return <Shield className="w-5 h-5 text-gray-300" />;
        if (strength <= 50) return <ShieldAlert className="w-5 h-5 text-red-500 animate-pulse" />;
        if (strength <= 75) return <Shield className="w-5 h-5 text-yellow-500" />;
        return <ShieldCheck className="w-5 h-5 text-green-500 animate-bounce" style={{ animationIterationCount: 1 }} />;
    };

    const getTip = () => {
        if (!password) return "Start typing to see requirements";
        const missing = REQUIREMENTS.find(req => !req.test(password));
        if (missing) {
            if (missing.id === "length") return password.length < 8 ? "Keep going, make it longer..." : "Too long, keep it under 33 chars";
            return `Next: ${missing.label}`;
        }
        return "Perfect! Your password is secure.";
    };

    return (
        <div className="space-y-4 p-5 bg-white rounded-2xl border border-gray-100 shadow-sm transition-all duration-300 hover:shadow-md">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    {getStrengthIcon()}
                    <div>
                        <span className="block text-sm font-bold text-gray-800 leading-none">{getStrengthText()}</span>
                        <span className="text-[10px] text-gray-400 mt-1 uppercase tracking-wider font-medium">{getTip()}</span>
                    </div>
                </div>
                <div className="text-right">
                    <span className="text-sm font-mono font-bold text-indigo-600">{Math.round(strength)}%</span>
                </div>
            </div>

            {/* Progress Bar with Sections */}
            <div className="flex gap-1 h-1.5 w-full">
                {[25, 50, 75, 100].map((step) => (
                    <div
                        key={step}
                        className={`h-full flex-1 rounded-full transition-all duration-500 ease-out ${strength >= step ? getStrengthColor() : "bg-gray-100"
                            }`}
                    />
                ))}
            </div>

            {/* Checklist */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                {REQUIREMENTS.map((req) => {
                    const isMet = req.test(password);
                    return (
                        <div
                            key={req.id}
                            className={`flex items-center gap-2 text-xs transition-all duration-300 ${isMet ? "text-slate-700 font-medium" : "text-slate-400"
                                }`}
                        >
                            <div className={`flex items-center justify-center w-5 h-5 rounded-full transition-all duration-500 ${isMet ? "bg-green-500 text-white rotate-0 scale-100" : "bg-slate-50 text-slate-300 -rotate-12 scale-90"
                                }`}>
                                {isMet ? (
                                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                                ) : (
                                    <X className="w-3.5 h-3.5" />
                                )}
                            </div>
                            <span className="transition-all duration-300">{req.label}</span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
