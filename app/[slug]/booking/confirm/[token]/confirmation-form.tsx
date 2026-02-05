"use client";

import { useActionState } from "react";
import { confirmBookingAction } from "../actions";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";

export default function ConfirmationForm({ token }: { token: string }) {
    const [state, formAction, isPending] = useActionState(confirmBookingAction, { success: false, error: "", bookingCode: "" });
    const [tosAccepted, setTosAccepted] = useState(false);
    const [responsibilityAccepted, setResponsibilityAccepted] = useState(false);

    if (state.success) {
        return (
            <div className="text-center py-6">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                    <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
                <p className="text-green-700 font-bold text-lg mb-2">Booking Confirmed</p>
                {state.bookingCode && (
                    <div className="bg-gray-100 rounded-lg p-4 mb-4">
                        <p className="text-sm text-gray-600 mb-1">Your Booking Code</p>
                        <p className="text-2xl font-bold tracking-wider">{state.bookingCode}</p>
                    </div>
                )}
                <p className="text-sm text-gray-600">Check your email for the full confirmation details.</p>
            </div>
        );
    }

    const canSubmit = tosAccepted && responsibilityAccepted;

    return (
        <form action={formAction} className="space-y-6">
            <input type="hidden" name="token" value={token} />

            {/* Terms and Conditions */}
            <div className="flex items-start">
                <div className="flex items-center h-5">
                    <input
                        id="tos"
                        name="tos"
                        type="checkbox"
                        required
                        className="focus:ring-2 focus:ring-offset-2 h-4 w-4 rounded border-gray-300"
                        onChange={(e) => setTosAccepted(e.target.checked)}
                    />
                </div>
                <div className="ml-3 text-sm">
                    <label htmlFor="tos" className="font-medium text-gray-700">
                        I accept the Terms and Conditions
                    </label>
                    <p className="text-gray-500">
                        You agree to the rental policy and liability waiver.
                    </p>
                </div>
            </div>

            {/* Responsibility Declaration */}
            <div className="flex items-start bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                <div className="flex items-center h-5">
                    <input
                        id="responsibility"
                        name="responsibility"
                        type="checkbox"
                        required
                        className="focus:ring-2 focus:ring-offset-2 h-4 w-4 rounded border-gray-300"
                        onChange={(e) => setResponsibilityAccepted(e.target.checked)}
                    />
                </div>
                <div className="ml-3 text-sm">
                    <label htmlFor="responsibility" className="font-medium text-gray-900">
                        I confirm the following
                    </label>
                    <ul className="text-gray-700 mt-2 space-y-1 list-disc list-inside">
                        <li>I will arrive at the pickup location on time</li>
                        <li>I understand payment is due on-site</li>
                        <li>I understand that no-shows are not acceptable and may affect future bookings</li>
                    </ul>
                </div>
            </div>

            {state.error && (
                <div className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">
                    {state.error}
                </div>
            )}

            <Button
                type="submit"
                disabled={!canSubmit || isPending}
                className="w-full"
                size="lg"
            >
                {isPending ? "Confirming..." : "Confirm Booking"}
            </Button>
        </form>
    );
}
