"use client";

import { useActionState, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { KeyRound, Eye, EyeOff, Lock, CheckCircle2 } from "lucide-react";
import { changePasswordAction } from "./actions";
import PasswordStrengthMeter, { getStrength } from "./password-strength-meter";
import { toast } from "sonner";

export default function PasswordChangeForm({ slug }: { slug: string }) {
    const [state, formAction, isPending] = useActionState(changePasswordAction, { success: false, error: "" });
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);

    const isStrengthMet = getStrength(newPassword) === 100;
    const isMatch = newPassword === confirmPassword && confirmPassword.length > 0;
    const canSubmit = isStrengthMet && isMatch && !isPending;

    useEffect(() => {
        if (state.success) {
            toast.success("Password updated successfully");
            setNewPassword("");
            setConfirmPassword("");
        } else if (state.error) {
            toast.error(state.error);
        }
    }, [state]);

    return (
        <form action={formAction} className="space-y-6 max-w-2xl">
            <input type="hidden" name="slug" value={slug} />

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-6">
                <div className="flex items-center gap-3 pb-4 border-b border-gray-50">
                    <div className="p-2 bg-indigo-50 rounded-lg">
                        <KeyRound className="w-5 h-5 text-indigo-600" />
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900">Change Password</h3>
                        <p className="text-sm text-gray-500">Update your account security credentials</p>
                    </div>
                </div>

                {/* Current Password */}
                <div className="space-y-2">
                    <Label htmlFor="currentPassword">Current Password</Label>
                    <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                            id="currentPassword"
                            name="currentPassword"
                            type="password"
                            required
                            placeholder="••••••••"
                            className="pl-10"
                        />
                    </div>
                </div>

                <div className="grid gap-6 sm:grid-cols-2">
                    {/* New Password */}
                    <div className="space-y-2">
                        <Label htmlFor="newPassword">New Password</Label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <Input
                                id="newPassword"
                                name="newPassword"
                                type={showPassword ? "text" : "password"}
                                required
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                placeholder="Min. 8 characters"
                                className="pl-10 pr-10"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                        </div>
                    </div>

                    {/* Confirm Password */}
                    <div className="space-y-2">
                        <Label htmlFor="confirmPassword">Confirm New Password</Label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <Input
                                id="confirmPassword"
                                name="confirmPassword"
                                type={showPassword ? "text" : "password"}
                                required
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="Repeat password"
                                className="pl-10 pr-10"
                            />
                            {isMatch && (
                                <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-green-500 animate-in fade-in zoom-in" />
                            )}
                        </div>
                        {confirmPassword && !isMatch && (
                            <p className="text-[10px] text-red-500 mt-1 animate-in slide-in-from-top-1">Passwords do not match</p>
                        )}
                    </div>
                </div>

                {/* Strength Meter */}
                <div className="animate-in fade-in slide-in-from-top-2 duration-500">
                    <PasswordStrengthMeter password={newPassword} />
                </div>

                <div className="pt-2">
                    <Button
                        type="submit"
                        disabled={!canSubmit || isPending}
                        className={`w-full transition-all duration-300 ${canSubmit ? "bg-indigo-600 hover:bg-indigo-700 shadow-md" : "bg-gray-100 text-gray-400"
                            }`}
                    >
                        {isPending ? "Updating..." : "Update Password"}
                    </Button>
                </div>
            </div>
        </form>
    );
}
