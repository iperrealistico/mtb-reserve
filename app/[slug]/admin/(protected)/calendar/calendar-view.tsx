"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { it } from "date-fns/locale"; // Assuming IT locale for MVP as requested, or EN
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface CalendarViewProps {
    slug: string;
    initialDate: Date;
    bookings: any[];
    timezone: string;
}

export default function BookingCalendarView({ slug, initialDate, bookings, timezone }: CalendarViewProps) {
    const router = useRouter();
    const [date, setDate] = useState<Date | undefined>(initialDate);

    // Update URL when date changes
    const onSelectDate = (newDate: Date | undefined) => {
        if (!newDate) return;
        setDate(newDate);
        // Format YYYY-MM-DD ensuring we don't shift due to timezone of Browser
        // Simple trick: newDate is usually set to 00:00 local browser time by DayPicker
        const y = newDate.getFullYear();
        const m = String(newDate.getMonth() + 1).padStart(2, '0');
        const d = String(newDate.getDate()).padStart(2, '0');
        const str = `${y}-${m}-${d}`;
        router.push(`/${slug}/admin/calendar?date=${str}`);
    };

    return (
        <div className="flex flex-col lg:flex-row gap-8">
            <div className="flex-none">
                <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
                    <Calendar
                        mode="single"
                        selected={date}
                        onSelect={onSelectDate}
                        className="rounded-md border"
                    />
                </div>
            </div>

            <div className="flex-1">
                <div className="bg-white p-6 rounded-lg shadow border border-gray-200 min-h-[500px]">
                    <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                        📅 Bookings for {date ? format(date, "d MMMM yyyy") : "..."}
                    </h2>

                    {bookings.length === 0 ? (
                        <div className="text-center py-12 text-gray-500">
                            No bookings found for this day.
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {bookings.map((booking) => (
                                <div key={booking.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                                    <div className="grid gap-1">
                                        <div className="flex items-center gap-2 font-medium">
                                            {booking.status === "CONFIRMED" && <Badge className="bg-green-500">Confirmed</Badge>}
                                            {booking.status === "PENDING_CONFIRM" && <Badge variant="secondary">Pending</Badge>}
                                            {booking.status === "CANCELLED" && <Badge variant="destructive">Cancelled</Badge>}
                                            <span className="text-gray-900">{booking.customerName}</span>
                                        </div>
                                        <div className="text-sm text-gray-500">
                                            {format(new Date(booking.startTime), "HH:mm")} - {format(new Date(booking.endTime), "HH:mm")}
                                            <span className="mx-2">•</span>
                                            {booking.quantity}x {booking.bikeType?.name}
                                        </div>
                                        <div className="text-xs text-gray-400">
                                            {booking.customerEmail} • {booking.customerPhone}
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        {/* Actions */}
                                        <Button variant="outline" size="sm">Details</Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
