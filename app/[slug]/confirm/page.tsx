import { confirmBookingAction } from "./actions";
import { format } from "date-fns";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function ConfirmPage({
    params,
    searchParams,
}: {
    params: Promise<{ slug: string }>;
    searchParams: Promise<{ token?: string }>;
}) {
    const { slug } = await params;
    const { token } = await searchParams; // searchParams is also a promise in Next 15

    if (!token) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
                <h1 className="text-2xl font-bold text-red-600">Invalid Link</h1>
                <p className="mt-2 text-gray-600">Missing confirmation token.</p>
            </div>
        );
    }

    const result = await confirmBookingAction(token);

    if ("error" in result) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center bg-gray-50">
                <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
                    <h1 className="text-2xl font-bold text-red-600 mb-4">Confirmation Failed</h1>
                    <p className="text-gray-600 mb-6">{result.error}</p>
                    <div className="mt-8 text-center">
                        <Button asChild variant="ghost">
                            <Link href={`/${slug}`}>
                                &larr; Back to Home
                            </Link>
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    const booking = result.booking!;

    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-green-50">
            <div className="bg-white p-8 rounded-lg shadow-lg max-w-lg w-full text-center">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                    <span className="text-2xl">✅</span>
                </div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Booking Confirmed!</h1>
                <p className="text-gray-500 mb-8">
                    Get ready for your ride. We've sent the details to <strong>{booking.customerEmail}</strong>.
                </p>

                <div className="bg-gray-50 rounded p-4 text-left space-y-2 text-sm text-gray-700 mb-8">
                    <div className="flex justify-between border-b pb-2">
                        <span className="font-medium">Date</span>
                        <span>{format(booking.startTime, "EEEE, MMMM do")}</span>
                    </div>
                    <div className="flex justify-between border-b py-2">
                        <span className="font-medium">Time</span>
                        <span>{format(booking.startTime, "HH:mm")} - {format(booking.endTime, "HH:mm")}</span>
                    </div>
                    <div className="flex justify-between border-b py-2">
                        <span className="font-medium">Bikes</span>
                        <span>{booking.quantity}x {booking.bikeType?.name || "MTB"}</span>
                    </div>
                    <div className="flex justify-between pt-2">
                        <span className="font-medium">Reference</span>
                        <span className="font-mono text-xs text-gray-500">{booking.id.slice(-8)}</span>
                    </div>
                </div>

                <div className="text-xs text-gray-400 mb-6">
                    Cancellation Policy: Please verify your email for cancellation instructions.
                </div>

                <Link href={`/${slug}`}>
                    <Button variant="outline">Back to Home</Button>
                </Link>
            </div>
        </div>
    );
}
