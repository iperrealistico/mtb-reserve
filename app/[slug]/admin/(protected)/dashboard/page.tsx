import { db } from "@/lib/db";
import { startOfDay, endOfDay, format } from "date-fns";
import { cancelBookingAction } from "./actions";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { CalendarDays, Users, AlertCircle } from "lucide-react";
import { Booking, BikeType } from "@prisma/client";

export default async function DashboardPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const today = new Date();

    // Fetch bookings for today
    const bookings = await db.booking.findMany({
        where: {
            tenantSlug: slug,
            startTime: {
                gte: startOfDay(today),
                lte: endOfDay(today),
            },
        },
        include: {
            bikeType: true,
        },
        orderBy: {
            startTime: 'asc',
        },
    });

    const pendingCount = bookings.filter(b => b.status === 'PENDING_CONFIRM').length;

    return (
        <div className="space-y-8 p-4 md:p-8 bg-gray-50 min-h-screen">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-heading font-bold text-gray-900">
                        Today's Operations
                    </h2>
                    <p className="text-xl text-gray-500 mt-1">
                        {format(today, "EEEE, MMMM do")}
                    </p>
                </div>
                <div className="flex gap-4">
                    {/* Placeholder for global actions */}
                </div>
            </div>

            {/* Big Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="border-2 border-gray-200 shadow-sm">
                    <CardContent className="p-6 flex items-center gap-4">
                        <div className="p-4 bg-blue-100 rounded-full text-blue-700">
                            <CalendarDays className="w-8 h-8" />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-gray-500 uppercase tracking-wide">Total Bookings</p>
                            <p className="text-4xl font-bold text-gray-900">{bookings.length}</p>
                        </div>
                    </CardContent>
                </Card>

                <Card className={`border-2 shadow-sm ${pendingCount > 0 ? 'border-orange-200 bg-orange-50' : 'border-gray-200'}`}>
                    <CardContent className="p-6 flex items-center gap-4">
                        <div className={`p-4 rounded-full ${pendingCount > 0 ? 'bg-orange-200 text-orange-800' : 'bg-green-100 text-green-700'}`}>
                            <AlertCircle className="w-8 h-8" />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-gray-500 uppercase tracking-wide">Pending Confirm</p>
                            <p className="text-4xl font-bold text-gray-900">{pendingCount}</p>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-2 border-gray-200 shadow-sm">
                    <CardContent className="p-6 flex items-center gap-4">
                        <div className="p-4 bg-gray-100 rounded-full text-gray-700">
                            <Users className="w-8 h-8" />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-gray-500 uppercase tracking-wide">Guests Expected</p>
                            <p className="text-4xl font-bold text-gray-900">
                                {bookings.reduce((acc: number, b: Booking & { bikeType: BikeType }) => acc + b.quantity, 0)}
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* List */}
            <div className="space-y-4">
                <h3 className="text-2xl font-bold text-gray-900 border-b border-gray-300 pb-2">
                    Departures & Returns
                </h3>

                {bookings.length === 0 ? (
                    <div className="p-12 text-center bg-white rounded-xl border-2 border-dashed border-gray-300">
                        <p className="text-gray-500 text-lg">No bookings scheduled for today.</p>
                    </div>
                ) : (
                    <div className="grid gap-4">
                        {bookings.map((booking: Booking & { bikeType: BikeType }) => (
                            <Card key={booking.id} className="border-2 border-gray-300 overflow-hidden hover:border-primary/50 transition-colors">
                                <div className="p-6 flex flex-col md:flex-row gap-6 md:items-center justify-between">

                                    {/* Time & Status */}
                                    <div className="flex flex-col gap-2 min-w-[140px]">
                                        <div className="text-2xl font-bold text-gray-900">
                                            {format(booking.startTime, "HH:mm")}
                                        </div>
                                        <Badge variant="outline" className={`
                                            w-fit text-sm py-1 px-3
                                            ${booking.status === 'CONFIRMED' ? 'bg-green-100 text-green-800 border-green-200' :
                                                booking.status === 'PENDING_CONFIRM' ? 'bg-orange-100 text-orange-800 border-orange-200' :
                                                    booking.status === 'CANCELLED' ? 'bg-red-100 text-red-800 border-red-200' : 'bg-gray-100'}
                                        `}>
                                            {booking.status}
                                        </Badge>
                                    </div>

                                    {/* Customer Info */}
                                    <div className="flex-1">
                                        <h4 className="text-xl font-bold text-gray-900">{booking.customerName}</h4>
                                        <p className="text-lg text-gray-600">
                                            {booking.quantity}x {booking.bikeType.name}
                                        </p>
                                        <p className="text-gray-500 flex items-center gap-2 mt-1">
                                            📞 {booking.customerPhone}
                                        </p>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex items-center gap-3">
                                        {/* Future: Hand Over Button */}
                                        {/* <Button size="lg" className="h-12 text-lg">Hand Over</Button> */}

                                        <form action={cancelBookingAction}>
                                            <input type="hidden" name="bookingId" value={booking.id} />
                                            <input type="hidden" name="slug" value={slug} />
                                            <Button
                                                variant="destructive"
                                                type="submit"
                                                size="lg"
                                                className="h-12 px-6 text-lg"
                                            >
                                                Cancel
                                            </Button>
                                        </form>
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
