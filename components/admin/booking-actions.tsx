"use client";

import { useState } from "react";
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
    Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MoreHorizontal, Ban, CheckCircle, Wallet, XCircle } from "lucide-react";
import { updateBookingStatusAction, markAsPaidAction, cancelBookingAction } from "@/app/[slug]/admin/(protected)/dashboard/actions";
import { toast } from "sonner";
import { Booking } from "@prisma/client";

interface BookingActionsProps {
    booking: {
        id: string;
        status: string;
        totalPrice?: number;
    };
    slug: string;
}

export function BookingActions({ booking, slug }: BookingActionsProps) {
    const [paidOpen, setPaidOpen] = useState(false);
    const [amount, setAmount] = useState<number>(0);

    const handleStatusUpdate = async (status: string) => {
        try {
            if (status === "CANCELLED") {
                const formData = new FormData();
                formData.append("bookingId", booking.id);
                formData.append("slug", slug);
                await cancelBookingAction(formData);
            } else {
                await updateBookingStatusAction(booking.id, slug, status);
            }
            toast.success(`Booking marked as ${status}`);
        } catch (e) {
            toast.error("Failed to update status");
        }
    };

    const handlePaidSubmit = async () => {
        try {
            await markAsPaidAction(booking.id, slug, amount);
            toast.success("Booking marked as PAID");
            setPaidOpen(false);
        } catch (e) {
            toast.error("Failed to mark as paid");
        }
    };

    const openPaidDialog = () => {
        setAmount(booking.totalPrice || 0);
        setPaidOpen(true);
    };

    return (
        <>
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
                        <DropdownMenuItem onClick={() => handleStatusUpdate("CONFIRMED")}>
                            <CheckCircle className="mr-2 h-4 w-4" /> Confirm
                        </DropdownMenuItem>
                    )}

                    <DropdownMenuItem onClick={openPaidDialog}>
                        <Wallet className="mr-2 h-4 w-4" /> Mark as Paid
                    </DropdownMenuItem>

                    <DropdownMenuItem onClick={() => handleStatusUpdate("COMPLETED")}>
                        <CheckCircle className="mr-2 h-4 w-4" /> Mark Completed
                    </DropdownMenuItem>

                    <DropdownMenuItem onClick={() => handleStatusUpdate("NO_SHOW")}>
                        <Ban className="mr-2 h-4 w-4" /> No Show
                    </DropdownMenuItem>

                    <DropdownMenuSeparator />

                    <DropdownMenuItem className="text-red-600" onClick={() => handleStatusUpdate("CANCELLED")}>
                        <XCircle className="mr-2 h-4 w-4" /> Cancel Booking
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

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
