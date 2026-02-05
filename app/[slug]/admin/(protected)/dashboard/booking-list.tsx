"use client";

import { useActionState, useState } from "react";
import { format } from "date-fns";
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import {
    Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MoreHorizontal, Ban, CheckCircle, Wallet, XCircle, Clock } from "lucide-react";
import { updateBookingStatusAction, markAsPaidAction, cancelBookingAction } from "./actions";
import { toast } from "sonner";
import { BikeType, Booking } from "@prisma/client";

type BookingWithBike = Booking & { bikeType: BikeType };

export default function BookingList({ bookings, slug }: { bookings: BookingWithBike[], slug: string }) {
    const [paidOpen, setPaidOpen] = useState(false);
    const [selectedBooking, setSelectedBooking] = useState<BookingWithBike | null>(null);
    const [amount, setAmount] = useState<number>(0);

    const handleStatusUpdate = async (id: string, status: string) => {
        try {
            if (status === "CANCELLED") {
                const formData = new FormData();
                formData.append("bookingId", id);
                formData.append("slug", slug);
                await cancelBookingAction(formData);
            } else {
                await updateBookingStatusAction(id, slug, status);
            }
            toast.success(`Booking marked as ${status}`);
        } catch (e) {
            toast.error("Failed to update status");
        }
    };

    const handlePaidSubmit = async () => {
        if (!selectedBooking) return;
        try {
            await markAsPaidAction(selectedBooking.id, slug, amount);
            toast.success("Booking marked as PAID");
            setPaidOpen(false);
        } catch (e) {
            toast.error("Failed to mark as paid");
        }
    };

    const openPaidDialog = (booking: BookingWithBike) => {
        setSelectedBooking(booking);
        setAmount(booking.totalPrice || 0);
        setPaidOpen(true);
    };

    return (
        <>
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
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" className="h-8 w-8 p-0">
                                                    <span className="sr-only">Open menu</span>
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                <DropdownMenuSeparator />

                                                {booking.status === 'PENDING_CONFIRM' && (
                                                    <DropdownMenuItem onClick={() => handleStatusUpdate(booking.id, "CONFIRMED")}>
                                                        <CheckCircle className="mr-2 h-4 w-4" /> Confirm
                                                    </DropdownMenuItem>
                                                )}

                                                <DropdownMenuItem onClick={() => openPaidDialog(booking)}>
                                                    <Wallet className="mr-2 h-4 w-4" /> Mark as Paid
                                                </DropdownMenuItem>

                                                <DropdownMenuItem onClick={() => handleStatusUpdate(booking.id, "COMPLETED")}>
                                                    <CheckCircle className="mr-2 h-4 w-4" /> Mark Completed
                                                </DropdownMenuItem>

                                                <DropdownMenuItem onClick={() => handleStatusUpdate(booking.id, "NO_SHOW")}>
                                                    <Ban className="mr-2 h-4 w-4" /> No Show
                                                </DropdownMenuItem>

                                                <DropdownMenuSeparator />

                                                <DropdownMenuItem className="text-red-600" onClick={() => handleStatusUpdate(booking.id, "CANCELLED")}>
                                                    <XCircle className="mr-2 h-4 w-4" /> Cancel Booking
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            <Dialog open={paidOpen} onOpenChange={setPaidOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Mark as Paid</DialogTitle>
                        <DialogDescription>
                            Enter the amount paid by the guest.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="amount" className="text-right">
                                Amount (€)
                            </Label>
                            <Input
                                id="amount"
                                type="number"
                                value={amount}
                                onChange={(e) => setAmount(Number(e.target.value))}
                                className="col-span-3"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button onClick={handlePaidSubmit}>Confirm Payment</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
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
