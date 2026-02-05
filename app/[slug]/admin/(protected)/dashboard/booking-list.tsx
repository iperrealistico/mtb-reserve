"use client";

import { format } from "date-fns";
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MoreHorizontal } from "lucide-react";
import { BookingActions } from "@/components/admin/booking-actions";
import { BikeType, Booking } from "@prisma/client";

type BookingWithBike = Booking & { bikeType: BikeType };

export default function BookingList({ bookings, slug }: { bookings: BookingWithBike[], slug: string }) {

    return (
        <div className="rounded-md border bg-white">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Date / Code</TableHead>
                        <TableHead>Customer</TableHead>
                        <TableHead>Details</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {bookings.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={6} className="text-center h-24 text-gray-500">
                                No bookings found.
                            </TableCell>
                        </TableRow>
                    ) : (
                        bookings.map((booking) => (
                            <TableRow key={booking.id}>
                                <TableCell>
                                    <div className="flex flex-col">
                                        <span className="font-medium">{format(booking.startTime, "MMM d")}</span>
                                        <span className="text-xs text-gray-500">{format(booking.startTime, "HH:mm")} - {format(booking.endTime, "HH:mm")}</span>
                                        <span className="text-xs font-mono bg-gray-100 px-1 rounded w-fit mt-1 text-gray-700">
                                            {booking.bookingCode || "PENDING"}
                                        </span>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="flex flex-col">
                                        <span className="font-medium">{booking.customerName}</span>
                                        <span className="text-xs text-gray-500">{booking.customerPhone}</span>
                                        <span className="text-xs text-gray-400 truncate max-w-[150px]">{booking.customerEmail}</span>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="flex flex-col">
                                        <span className="font-medium">{booking.quantity}x {booking.bikeType.name}</span>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="flex flex-col">
                                        <span className="font-medium">
                                            €{(booking.totalPrice || 0).toFixed(2)}
                                        </span>
                                        {booking.paidAmount > 0 && (
                                            <span className="text-xs text-green-600 font-medium">
                                                Paid: €{booking.paidAmount.toFixed(2)}
                                            </span>
                                        )}
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <StatusBadge status={booking.status} />
                                </TableCell>
                                <TableCell className="text-right">
                                    <BookingActions booking={booking} slug={slug} />
                                </TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>
        </div>
    );
}

function StatusBadge({ status }: { status: string }) {
    const variants: Record<string, string> = {
        PENDING_CONFIRM: "bg-orange-100 text-orange-800 border-orange-200",
        CONFIRMED: "bg-blue-100 text-blue-800 border-blue-200",
        PAID: "bg-green-100 text-green-800 border-green-200",
        COMPLETED: "bg-gray-100 text-gray-800 border-gray-200",
        CANCELLED: "bg-red-100 text-red-800 border-red-200",
        NO_SHOW: "bg-red-50 text-red-600 border-red-100",
    };

    return (
        <Badge variant="outline" className={`w-fit text-xs py-0.5 px-2 ${variants[status] || "bg-gray-100"}`}>
            {status.replace("_", " ")}
        </Badge>
    );
}
