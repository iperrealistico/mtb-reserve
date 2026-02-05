import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import ConfirmationForm from "./confirmation-form";
import { format } from "date-fns";
import { CheckCircle } from "lucide-react";

export default async function BookingConfirmationPage({ params }: { params: Promise<{ slug: string, token: string }> }) {
    const { slug, token } = await params;

    const booking = await db.booking.findUnique({
        where: { confirmationToken: token },
        include: { bikeType: true, tenant: true }
    });

    if (!booking) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
                <div className="bg-white p-8 rounded-lg shadow-lg text-center max-w-md w-full">
                    <h1 className="text-xl font-bold text-red-600 mb-2">Invalid or Expired Link</h1>
                    <p className="text-gray-600">We could not find this booking. It may have been cancelled or the link is invalid.</p>
                </div>
            </div>
        );
    }

    // Security check: Ensure slug matches (though token is unique globally, context matters)
    if (booking.tenantSlug !== slug) notFound();

    if (booking.status === "CONFIRMED") {
        return (
            <div className="min-h-screen bg-green-50 flex flex-col items-center justify-center p-4">
                <div className="bg-white p-8 rounded-lg shadow-lg text-center max-w-md w-full">
                    <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                        <CheckCircle className="h-6 w-6 text-green-600" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Booking Confirmed!</h1>
                    <p className="text-gray-600 mb-6">
                        You have already confirmed this booking.
                    </p>
                    <div className="bg-gray-50 p-4 rounded text-left text-sm space-y-2">
                        <p><strong>Date:</strong> {format(booking.startTime, "PPP")}</p>
                        <p><strong>Bike:</strong> {booking.bikeType.name}</p>
                        <p><strong>Quantity:</strong> {booking.quantity}</p>
                    </div>
                    <p className="mt-6 text-sm text-gray-500">
                        Check your email for details.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md mx-auto bg-white rounded-lg shadow overflow-hidden">
                <div className="bg-indigo-600 px-6 py-4">
                    <h1 className="text-xl font-bold text-white">Confirm Your Booking</h1>
                    <p className="text-indigo-100 text-sm">{booking.tenant.name}</p>
                </div>

                <div className="p-6">
                    <div className="space-y-4 mb-8">
                        <div className="flex justify-between border-b pb-2">
                            <span className="text-gray-600">Date</span>
                            <span className="font-medium">{format(booking.startTime, "PPP")}</span>
                        </div>
                        <div className="flex justify-between border-b pb-2">
                            <span className="text-gray-600">Time</span>
                            <span className="font-medium">{format(booking.startTime, "p")} - {format(booking.endTime, "p")}</span>
                        </div>
                        <div className="flex justify-between border-b pb-2">
                            <span className="text-gray-600">Bike</span>
                            <span className="font-medium">{booking.bikeType.name}</span>
                        </div>
                        <div className="flex justify-between border-b pb-2">
                            <span className="text-gray-600">Quantity</span>
                            <span className="font-medium">{booking.quantity}</span>
                        </div>
                        <div className="flex justify-between border-b pb-2">
                            <span className="text-gray-600">Guest</span>
                            <span className="font-medium">{booking.customerName}</span>
                        </div>
                        {(booking.totalPrice || 0) > 0 && (
                            <div className="flex justify-between border-b pb-2 border-gray-200 bg-green-50 p-2 rounded -mx-2">
                                <span className="text-gray-900 font-bold">Total Price</span>
                                <span className="font-bold text-green-700">€{(booking.totalPrice || 0).toFixed(2)}</span>
                            </div>
                        )}
                    </div>

                    <ConfirmationForm token={token} />
                </div>
            </div>
        </div>
    );
}
