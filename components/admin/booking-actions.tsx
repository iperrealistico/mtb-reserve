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

    // Confirmation State
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [pendingStatus, setPendingStatus] = useState<string | null>(null);
    const [notifyUser, setNotifyUser] = useState(true);

    const handleStatusClick = (status: string) => {
        if (status === "CANCELLED" || status === "NO_SHOW") {
            setPendingStatus(status);
            setNotifyUser(true); // Default to sending email
            setConfirmOpen(true);
        } else {
            // Direct update for other statuses
            executeStatusUpdate(status, false);
        }
    };

    const executeStatusUpdate = async (status: string, notify: boolean) => {
        try {
            if (status === "CANCELLED") {
                const formData = new FormData();
                formData.append("bookingId", booking.id);
                formData.append("slug", slug);
                formData.append("notifyUser", String(notify));
                await cancelBookingAction(formData);
            } else {
                await updateBookingStatusAction(booking.id, slug, status, notify);
            }
            toast.success(`Booking marked as ${status}`);
        } catch (e) {
            toast.error("Failed to update status");
        }
        setConfirmOpen(false);
        setPendingStatus(null);
    };

    const handleConfirm = () => {
        if (pendingStatus) {
            executeStatusUpdate(pendingStatus, notifyUser);
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
                        <DropdownMenuItem onClick={() => handleStatusClick("CONFIRMED")}>
                            <CheckCircle className="mr-2 h-4 w-4" /> Confirm
                        </DropdownMenuItem>
                    )}

                    <DropdownMenuItem onClick={openPaidDialog}>
                        <Wallet className="mr-2 h-4 w-4" /> Mark as Paid
                    </DropdownMenuItem>

                    <DropdownMenuItem onClick={() => handleStatusClick("COMPLETED")}>
                        <CheckCircle className="mr-2 h-4 w-4" /> Mark Completed
                    </DropdownMenuItem>

                    <DropdownMenuItem onClick={() => handleStatusClick("NO_SHOW")}>
                        <Ban className="mr-2 h-4 w-4" /> No Show
                    </DropdownMenuItem>

                    <DropdownMenuSeparator />

                    <DropdownMenuItem className="text-red-600" onClick={() => handleStatusClick("CANCELLED")}>
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
                        <div className="grid gap-2">
                            <Label htmlFor="amount">Amount (€)</Label>
                            <Input
                                id="amount"
                                type="number"
                                value={amount}
                                onChange={(e) => setAmount(Number(e.target.value))}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button onClick={handlePaidSubmit}>Confirm Payment</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Confirm Update: {pendingStatus}</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to mark this booking as {pendingStatus}?
                        </DialogDescription>
                    </DialogHeader>

                    <div className="flex items-center space-x-2 py-4">
                        <input
                            type="checkbox"
                            id="notify"
                            className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                            checked={notifyUser}
                            onChange={(e) => setNotifyUser(e.target.checked)}
                        />
                        <Label htmlFor="notify" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                            Send notification email to user
                        </Label>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setConfirmOpen(false)}>Cancel</Button>
                        <Button onClick={handleConfirm} variant={pendingStatus === "CANCELLED" ? "destructive" : "default"}>
                            Confirm
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
