import { db } from "@/lib/db";
import { startOfDay, endOfDay, format } from "date-fns";
import { Card, CardContent } from "@/components/ui/card";
import { CalendarDays, Users, AlertCircle } from "lucide-react";
import { Booking, BikeType } from "@prisma/client";
import BookingList from "./booking-list";

export default async function DashboardPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const today = new Date();

    // 1. Fetch Today's stats
    const todayBookings = await db.booking.findMany({
        where: {
            tenantSlug: slug,
            startTime: {
                gte: startOfDay(today),
                lte: endOfDay(today),
            },
            status: { not: "CANCELLED" }
        },
        include: { bikeType: true }
    });

    const pendingCount = await db.booking.count({
        where: {
            tenantSlug: slug,
            status: 'PENDING_CONFIRM',
            endTime: { gte: today }
        }
    });

    // 2. Fetch All Bookings for the List
    const allBookings = await db.booking.findMany({
        where: { tenantSlug: slug },
        include: { bikeType: true },
        orderBy: { startTime: 'desc' },
        take: 200 // Limit for performance
    });

    return (
        <div className="space-y-8 p-4 md:p-8 bg-gray-50 min-h-screen">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-heading font-bold text-gray-900">
                        Dashboard
                    </h2>
                    <p className="text-xl text-gray-500 mt-1">
                        {format(today, "EEEE, MMMM do")}
                    </p>
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
                            <p className="text-sm font-bold text-gray-500 uppercase tracking-wide">Today's Guests</p>
                            <p className="text-4xl font-bold text-gray-900">
                                {todayBookings.reduce((acc, b) => acc + b.quantity, 0)}
                            </p>
                        </div>
                    </CardContent>
                </Card>

                <Card className={`border-2 shadow-sm ${pendingCount > 0 ? 'border-orange-200 bg-orange-50' : 'border-gray-200'}`}>
                    <CardContent className="p-6 flex items-center gap-4">
                        <div className={`p-4 rounded-full ${pendingCount > 0 ? 'bg-orange-200 text-orange-800' : 'bg-green-100 text-green-700'}`}>
                            <AlertCircle className="w-8 h-8" />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-gray-500 uppercase tracking-wide">Pending Action</p>
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
                            <p className="text-sm font-bold text-gray-500 uppercase tracking-wide">Total Bookings</p>
                            <p className="text-4xl font-bold text-gray-900">
                                {allBookings.length}
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* List */}
            <div className="space-y-4">
                <h3 className="text-2xl font-bold text-gray-900 border-b border-gray-300 pb-2">
                    Booking Management
                </h3>

                <BookingList bookings={allBookings as any} slug={slug} />
            </div>
        </div>
    );
}
