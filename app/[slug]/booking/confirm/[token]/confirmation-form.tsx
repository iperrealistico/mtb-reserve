"use client";

import { useActionState } from "react";
import { confirmBookingAction } from "../actions";
import { useState } from "react";

export default function ConfirmationForm({ token }: { token: string }) {
    const [state, formAction, isPending] = useActionState(confirmBookingAction, { success: false, error: "" });
    const [accepted, setAccepted] = useState(false);
    // Removed captchaToken state

    if (state.success) {
        return (
            <div className="text-center py-4">
                <p className="text-green-600 font-bold text-lg">Confirmed!</p>
                <button onClick={() => window.location.reload()} className="text-indigo-600 underline text-sm mt-2">
                    Refresh to view summary
                </button>
            </div>
        );
    }

    return (
        <form action={formAction} className="space-y-6">
            <input type="hidden" name="token" value={token} />

            <div className="flex items-start">
                <div className="flex items-center h-5">
                    <input
                        id="tos"
                        name="tos"
                        type="checkbox"
                        required
                        className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
                        onChange={(e) => setAccepted(e.target.checked)}
                    />
                </div>
                <div className="ml-3 text-sm">
                    <label htmlFor="tos" className="font-medium text-gray-700">
                        I accept the <a href="#" className="text-indigo-600 hover:text-indigo-500">Terms and Conditions</a>
                    </label>
                    <p className="text-gray-500">
                        You agree to the rental policy and liability waiver.
                    </p>
                </div>
            </div>

            {/* Removed ReCAPTCHA container */}

            {state.error && (
                <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
                    {state.error}
                </div>
            )}

            <button
                type="submit"
                disabled={!accepted || isPending}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {isPending ? "Confirming..." : "Confirm Booking"}
            </button>
        </form>
    );
}
