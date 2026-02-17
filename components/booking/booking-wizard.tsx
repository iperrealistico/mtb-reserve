"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
// Removed ReCAPTCHA import
import { format } from "date-fns";
import { Loader2, Info, CheckCircle } from "lucide-react";
import { Tenant, BikeType } from "@prisma/client";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";

import { getAvailabilityAction, submitBookingAction } from "@/app/[slug]/actions";
import { AvailabilityResult } from "@/lib/availability";
import { BookingStepper } from "./booking-stepper";
import { SummaryCard } from "./summary-card";

// Types
type Step = "date" | "slot" | "bike" | "details" | "confirmation";

// Schema for the form part (Details)
const detailsSchema = z.object({
    customerName: z.string().min(2, "Name is required"),
    customerEmail: z.string().email("Invalid email"),
    customerPhone: z.string().min(6, "Phone is required"),
});

type FormValues = z.infer<typeof detailsSchema>;

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function BookingWizard({ tenant }: { tenant: Tenant & { bikeTypes: BikeType[] } }) {
    // State
    const [step, setStep] = useState<Step>("date");
    const [date, setDate] = useState<Date | undefined>(undefined);

    // Dialog State
    const [alertOpen, setAlertOpen] = useState(false);
    const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);
    const [alertMessage, setAlertMessage] = useState({ title: "", desc: "" });

    // Data State
    const [loadingSlots, setLoadingSlots] = useState(false);
    const [slots, setSlots] = useState<any[]>([]);
    const [availability, setAvailability] = useState<Record<string, AvailabilityResult>>({});

    // Selection State
    const [selectedSlotId, setSelectedSlotId] = useState<string>("");

    // Multi-Selection State: bikeId -> quantity
    const [selectedItems, setSelectedItems] = useState<Record<string, number>>({});

    const [isSubmitting, setIsSubmitting] = useState(false);

    // Using totalSelectedQuantity for checks
    const totalSelectedQuantity = Object.values(selectedItems).reduce((a, b) => a + b, 0);

    // Helper: Safe Action Wrapper
    const safeAction = (action: () => void, title: string, desc: string) => {
        if (totalSelectedQuantity > 0 || (step === "bike" && selectedSlotId)) {
            setPendingAction(() => action);
            setAlertMessage({ title, desc });
            setAlertOpen(true);
        } else {
            action();
        }
    };

    const confirmAction = () => {
        if (pendingAction) pendingAction();
        setAlertOpen(false);
        setPendingAction(null);
    };

    // Form Hook
    const { register, handleSubmit, formState: { errors }, watch } = useForm<FormValues>({
        resolver: zodResolver(detailsSchema)
    });

    // Fetch Availability Effect
    useEffect(() => {
        if (date) {
            setLoadingSlots(true);
            setSelectedSlotId(""); // Reset slot when date changes
            setSelectedItems({}); // Reset bikes
            setStep("slot"); // Auto-advance

            getAvailabilityAction(tenant.slug, date)
                .then((res) => {
                    setSlots(res.slots);
                    setAvailability(res.availability);
                })
                .finally(() => setLoadingSlots(false));
        }
    }, [date, tenant.slug]);

    // Handlers
    const handleSlotSelect = (slotId: string) => {
        const select = () => {
            setSelectedSlotId(slotId);
            setSelectedItems({}); // Clear selection on slot change
            setStep("bike");
        };

        if (totalSelectedQuantity > 0 && selectedSlotId !== slotId) {
            safeAction(select, "Change Time Slot?", "Changing the time slot will clear your selected bikes.");
        } else {
            select();
        }
    };

    const handleChangeDate = () => {
        safeAction(
            () => setStep("date"),
            "Change Date?",
            "Going back to date selection will reset your current progress."
        );
    };

    const handleQuantityChange = (bikeId: string, delta: number) => {
        const currentQty = selectedItems[bikeId] || 0;
        const maxQty = availability[selectedSlotId]?.[bikeId] || 0;

        const newQty = Math.max(0, Math.min(maxQty, currentQty + delta));

        setSelectedItems(prev => {
            const next = { ...prev, [bikeId]: newQty };
            if (newQty === 0) delete next[bikeId];
            return next;
        });
    };

    const onSubmit = async (data: FormValues) => {
        if (!date || !selectedSlotId || Object.keys(selectedItems).length === 0) return;

        setIsSubmitting(true);

        // Construct Items Array
        const items = Object.entries(selectedItems).map(([bikeId, quantity]) => ({
            bikeTypeId: bikeId,
            quantity
        }));

        const formData = new FormData();
        formData.append("slug", tenant.slug);
        formData.append("date", date!.toISOString());
        formData.append("slotId", selectedSlotId);
        formData.append("items", JSON.stringify(items));

        // Contact Info
        formData.append("customerName", data.customerName);
        formData.append("customerEmail", data.customerEmail);
        formData.append("customerPhone", data.customerPhone);

        console.log("[BookingWizard] Submitting booking request...", { slotId: selectedSlotId, items });

        try {
            // 20 Second Timeout Guard
            const timeoutPromise = new Promise<{ error?: string }>((_, reject) => {
                setTimeout(() => reject(new Error("Request timed out. Please check your connection.")), 20000);
            });

            const result = await Promise.race([
                submitBookingAction(null, formData),
                timeoutPromise
            ]) as any;

            console.log("[BookingWizard] Submission result:", result);

            if (result.error) {
                toast.error(result.error);
                setIsSubmitting(false);
            } else {
                setStep("confirmation");
                window.scrollTo(0, 0);
                setIsSubmitting(false);
            }
        } catch (err: any) {
            console.error("[BookingWizard] Submission error:", err);
            toast.error(err.message || "An unexpected error occurred.");
            setIsSubmitting(false);
        }
    };

    // Derived UI Data
    const formatSlotLabel = (id: string) => {
        const slot = slots.find(s => s.id === id);
        return (slot?.label && slot.label.trim() !== "") ? slot.label : "Standard Slot";
    };

    const getSelectedItemsTags = () => {
        return Object.entries(selectedItems).map(([id, qty]) => {
            const bike = tenant.bikeTypes.find(b => b.id === id);
            return { name: bike?.name || "Unknown Bike", quantity: qty };
        });
    };

    const calculatePrice = () => {
        if (!selectedSlotId || Object.keys(selectedItems).length === 0) return 0;
        const slot = slots.find(s => s.id === selectedSlotId);
        if (!slot) return 0;

        const getHours = (time: string) => {
            const [h, m] = time.split(':').map(Number);
            return h + (m / 60);
        };
        const duration = getHours(slot.end) - getHours(slot.start);

        let total = 0;
        Object.entries(selectedItems).forEach(([bikeId, qty]) => {
            const bike = tenant.bikeTypes.find(b => b.id === bikeId);
            if (bike) {
                total += (bike.costPerHour || 0) * duration * qty;
            }
        });

        return total;
    };

    const stepsList = [
        { id: "date", label: "Date" },
        { id: "slot", label: "Time" },
        { id: "bike", label: "Equipment" },
        { id: "details", label: "Details" },
    ];

    // Render
    return (
        <div className="max-w-5xl mx-auto p-4 md:p-8">
            {/* Top Stepper */}
            <div className="mb-8">
                <BookingStepper steps={stepsList} currentStepId={step === "confirmation" ? "details" : step} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                {/* Main Content Area */}
                <div className="lg:col-span-8 space-y-8 min-h-[400px]">

                    {tenant.bikeTypes.length === 0 && (
                        <div className="bg-orange-50 border-l-4 border-orange-500 p-6 rounded-r-xl">
                            <h3 className="text-lg font-bold text-orange-800 mb-2">No Bikes Available</h3>
                            <p className="text-orange-700">
                                We currently don&apos;t have any equipment listed for booking. Please check back later or contact us directly.
                            </p>
                        </div>
                    )}

                    {step === "confirmation" ? (
                        <div className="flex flex-col items-center justify-center min-h-[400px]">
                            <div className="bg-white rounded-2xl p-8 text-center shadow-[0_6px_16px_rgba(0,0,0,0.08)] border border-gray-100 max-w-lg w-full">
                                <div className="mx-auto w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6">
                                    <CheckCircle className="w-10 h-10" />
                                </div>
                                <h2 className="text-3xl font-heading font-bold text-gray-900 mb-2">Request Received!</h2>
                                <p className="text-gray-600 text-lg mb-8 max-w-md mx-auto">
                                    We have sent a confirmation link to <span className="font-semibold text-gray-900">{watch("customerEmail")}</span>.
                                </p>
                                <div className="bg-blue-50 text-blue-800 p-4 rounded-xl text-sm mb-8 flex items-start gap-3 text-left">
                                    <Info className="w-5 h-5 shrink-0 mt-0.5" />
                                    <div>
                                        <strong>Check your inbox within 30 minutes.</strong><br />
                                        Your booking is held temporarily. If not confirmed, the bikes will be released.
                                    </div>
                                </div>
                                <Button onClick={() => window.location.reload()} variant="outline">Book Another</Button>
                            </div>
                        </div>
                    ) : (
                        <>
                            {/* Step 1: Date */}
                            {step === "date" && (
                                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col items-center">
                                    <h2 className="text-2xl font-heading font-bold mb-6">When do you want to ride?</h2>
                                    <Calendar
                                        mode="single"
                                        selected={date}
                                        onSelect={(d) => { setDate(d); /* Effect triggers transition */ }}
                                        disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                                        className="rounded-xl border shadow-sm p-4"
                                    />
                                </div>
                            )}

                            {/* Step 2: Slot */}
                            {step === "slot" && (
                                <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                                    <div className="flex items-center justify-between">
                                        <h2 className="text-2xl font-heading font-bold">Choose a time</h2>
                                        <Button variant="ghost" onClick={handleChangeDate}>Change Date</Button>
                                    </div>

                                    {loadingSlots ? (
                                        <div className="flex justify-center p-12"><Loader2 className="animate-spin text-primary w-8 h-8" /></div>
                                    ) : (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {slots.map(slot => {
                                                const slotAvail = availability[slot.id] || {};
                                                const totalAvail = Object.values(slotAvail).reduce((a: any, b: any) => a + b, 0) as number;
                                                const isSoldOut = totalAvail <= 0;

                                                return (
                                                    <button
                                                        key={slot.id}
                                                        onClick={() => !isSoldOut && handleSlotSelect(slot.id)}
                                                        disabled={isSoldOut}
                                                        className={`
                                                relative flex flex-col items-start p-6 rounded-2xl border-2 transition-all text-left
                                                ${isSoldOut
                                                                ? 'border-gray-100 bg-gray-50 opacity-60 cursor-not-allowed'
                                                                : 'border-gray-200 bg-white hover:border-primary/50 hover:shadow-md cursor-pointer'
                                                            }
                                            `}
                                                    >
                                                        <span className="text-lg font-bold text-gray-900 mb-1">
                                                            {(slot.label && slot.label.trim() !== "") ? slot.label : "Standard Slot"}
                                                        </span>
                                                        <div className="mt-2">
                                                            {isSoldOut ? (
                                                                <Badge variant="secondary">Sold Out</Badge>
                                                            ) : (
                                                                <Badge variant="success" className="bg-green-100 text-green-700 hover:bg-green-200">
                                                                    {totalAvail > 5 ? "Available" : `${totalAvail} spots left`}
                                                                </Badge>
                                                            )}
                                                        </div>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Step 3: Bike (Multi-Select) */}
                            {step === "bike" && (
                                <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                                    <div className="flex items-center justify-between">
                                        <h2 className="text-2xl font-heading font-bold">Pick your bikes</h2>
                                        <Button variant="ghost" onClick={() => setStep("slot")}>Back</Button>
                                    </div>

                                    <div className="flex flex-col gap-4">
                                        {tenant.bikeTypes.map(bike => {
                                            const stock = availability[selectedSlotId]?.[bike.id] || 0;
                                            const isSoldOut = stock <= 0;
                                            const quantity = selectedItems[bike.id] || 0;

                                            return (
                                                <div
                                                    key={bike.id}
                                                    className={`
                                            flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 rounded-xl border-2 transition-all
                                            ${isSoldOut ? 'border-gray-100 bg-gray-50 opacity-60' : 'border-gray-200 bg-white'}
                                        `}
                                                >
                                                    <div className="flex flex-col mb-4 sm:mb-0">
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-lg font-bold text-gray-900">{bike.name}</span>
                                                            {isSoldOut ? (
                                                                <Badge variant="secondary" className="text-xs">Sold Out</Badge>
                                                            ) : (
                                                                <Badge variant="outline" className={`text-xs ${stock < 3 ? "text-orange-600 border-orange-200 bg-orange-50" : "text-gray-600"}`}>
                                                                    {stock} left
                                                                </Badge>
                                                            )}
                                                        </div>
                                                        <p className="text-sm text-gray-500 line-clamp-2 mt-1 max-w-sm">{bike.description || "High performance MTB suitable for all trails."}</p>
                                                        {(bike.costPerHour || 0) > 0 && <span className="text-sm font-medium text-primary mt-1">€{bike.costPerHour?.toFixed(2)}/hr</span>}
                                                    </div>

                                                    <div className="flex items-center gap-3">
                                                        <Button
                                                            variant="outline" size="icon" className="h-8 w-8 rounded-full"
                                                            onClick={() => handleQuantityChange(bike.id, -1)}
                                                            disabled={quantity === 0 || isSoldOut}
                                                        >
                                                            -
                                                        </Button>
                                                        <span className="w-6 text-center font-bold text-lg">{quantity}</span>
                                                        <Button
                                                            variant="outline" size="icon" className="h-8 w-8 rounded-full"
                                                            onClick={() => handleQuantityChange(bike.id, 1)}
                                                            disabled={quantity >= stock || isSoldOut}
                                                        >
                                                            +
                                                        </Button>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>

                                    <div className="pt-4 flex justify-end">
                                        <Button
                                            size="lg"
                                            disabled={totalSelectedQuantity === 0}
                                            onClick={() => setStep("details")}
                                        >
                                            Next Step
                                        </Button>
                                    </div>
                                </div>
                            )}

                            {/* Step 4: Details */}
                            {step === "details" && (
                                <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                                    <div className="flex items-center justify-between mb-4">
                                        <h2 className="text-2xl font-heading font-bold">Almost there</h2>
                                        <Button variant="ghost" onClick={() => setStep("bike")}>Back</Button>
                                    </div>

                                    <Card className="border-none shadow-none bg-transparent">
                                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div className="space-y-2">
                                                    <Label htmlFor="customerName">Full Name</Label>
                                                    <Input id="customerName" placeholder="e.g. Mario Rossi" {...register("customerName")} />
                                                    {errors.customerName && <p className="text-sm text-red-500">{errors.customerName.message}</p>}
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor="customerEmail">Email Address</Label>
                                                    <Input id="customerEmail" type="email" placeholder="mario@example.com" {...register("customerEmail")} />
                                                    {errors.customerEmail && <p className="text-sm text-red-500">{errors.customerEmail.message}</p>}
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor="customerPhone">Mobile Phone</Label>
                                                    <Input id="customerPhone" type="tel" placeholder="+39 333 ..." {...register("customerPhone")} />
                                                    {errors.customerPhone && <p className="text-sm text-red-500">{errors.customerPhone.message}</p>}
                                                </div>
                                            </div>

                                            <div className="bg-gray-50 p-4 rounded-xl text-sm text-gray-600">
                                                By clicking "Request Booking", you agree to our terms of service.
                                                Payment is not required at this stage.
                                            </div>

                                            <Button
                                                type="submit"
                                                size="lg"
                                                className="w-full text-lg"
                                                disabled={isSubmitting}
                                                isLoading={isSubmitting}
                                            >
                                                Request Booking ({totalSelectedQuantity} items)
                                            </Button>
                                        </form>
                                    </Card>
                                </div>
                            )}
                        </>
                    )}
                </div>

                {/* Sidebar Summary */}
                <div className="lg:col-span-4">
                    {step !== "confirmation" && (
                        <SummaryCard
                            date={date}
                            slotLabel={formatSlotLabel(selectedSlotId)}
                            items={getSelectedItemsTags()}
                            loading={loadingSlots}
                            totalPrice={calculatePrice()}
                        />
                    )}
                </div>

            </div>

            {/* Alert Dialog */}
            <AlertDialog open={alertOpen} onOpenChange={setAlertOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>{alertMessage.title}</AlertDialogTitle>
                        <AlertDialogDescription>
                            {alertMessage.desc}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setAlertOpen(false)}>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={confirmAction}>Confirm</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
