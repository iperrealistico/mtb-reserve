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
    quantity: z.number().min(1).max(5),
});

type FormValues = z.infer<typeof detailsSchema>;

export default function BookingWizard({ tenant }: { tenant: Tenant & { bikeTypes: BikeType[] } }) {
    // State
    const [step, setStep] = useState<Step>("date");
    const [date, setDate] = useState<Date | undefined>(undefined);

    // Data State
    const [loadingSlots, setLoadingSlots] = useState(false);
    const [slots, setSlots] = useState<any[]>([]);
    const [availability, setAvailability] = useState<Record<string, AvailabilityResult>>({});

    // Selection State
    const [selectedSlotId, setSelectedSlotId] = useState<string>("");
    const [selectedBikeTypeId, setSelectedBikeTypeId] = useState<string>("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    // Removed captchaToken state

    // Form Hook
    const { register, handleSubmit, formState: { errors }, watch } = useForm<FormValues>({
        resolver: zodResolver(detailsSchema),
        defaultValues: {
            quantity: 1,
        }
    });

    const watchQuantity = watch("quantity");

    // Fetch Availability Effect
    useEffect(() => {
        if (date) {
            setLoadingSlots(true);
            setSelectedSlotId(""); // Reset slot when date changes
            setSelectedBikeTypeId(""); // Reset bike
            setStep("slot"); // Auto-advance

            getAvailabilityAction(tenant.slug, date)
                .then((res) => {
                    setSlots(res.slots);
                    setAvailability(res.availability);
                })
                .finally(() => setLoadingSlots(false));
        }
    }, [date, tenant.slug]);

    // Removed recaptchaRef

    // Handlers
    const handleSlotSelect = (slotId: string) => {
        setSelectedSlotId(slotId);
        setStep("bike");
    };

    const handleBikeSelect = (bikeId: string) => {
        setSelectedBikeTypeId(bikeId);
        setStep("details");
    };

    // Removed onCaptchaChange, pendingDataRef, useEffect for token

    const onSubmit = async (data: FormValues) => {
        if (!date || !selectedSlotId || !selectedBikeTypeId) return;

        setIsSubmitting(true);
        const formData = new FormData();
        formData.append("slug", tenant.slug);
        formData.append("date", date!.toISOString());
        formData.append("slotId", selectedSlotId);
        formData.append("bikeTypeId", selectedBikeTypeId);
        formData.append("quantity", data.quantity.toString());
        formData.append("customerName", data.customerName);
        formData.append("customerEmail", data.customerEmail);
        formData.append("customerPhone", data.customerPhone);
        // Removed recaptchaToken append

        console.log("[BookingWizard] Submitting booking request...", { slotId: selectedSlotId, bike: selectedBikeTypeId });

        try {
            // 20 Second Timeout Guard
            const timeoutPromise = new Promise<{ error?: string }>((_, reject) => {
                setTimeout(() => reject(new Error("Request timed out. Please check your connection.")), 20000);
            });

            const result = await Promise.race([
                submitBookingAction(null, formData),
                timeoutPromise
            ]) as any; // Type casting for the race result

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
    const formatBikeName = (id: string) => tenant.bikeTypes.find(b => b.id === id)?.name;

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
                        <div className="bg-white rounded-2xl p-8 text-center shadow-[0_6px_16px_rgba(0,0,0,0.08)] border border-gray-100">
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
                                        <Button variant="ghost" onClick={() => setStep("date")}>Change Date</Button>
                                    </div>

                                    {loadingSlots ? (
                                        <div className="flex justify-center p-12"><Loader2 className="animate-spin text-primary w-8 h-8" /></div>
                                    ) : (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {slots.map(slot => {
                                                // Calculate simple aggregate availability for label
                                                // logic: sum all bikes for this slot
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

                            {/* Step 3: Bike */}
                            {step === "bike" && (
                                <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                                    <div className="flex items-center justify-between">
                                        <h2 className="text-2xl font-heading font-bold">Pick your bike</h2>
                                        <Button variant="ghost" onClick={() => setStep("slot")}>Back</Button>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {tenant.bikeTypes.map(bike => {
                                            const stock = availability[selectedSlotId]?.[bike.id] || 0;
                                            const isSoldOut = stock <= 0;

                                            return (
                                                <button
                                                    key={bike.id}
                                                    onClick={() => !isSoldOut && handleBikeSelect(bike.id)}
                                                    disabled={isSoldOut}
                                                    className={`
                                            relative flex flex-col items-start p-6 rounded-2xl border-2 transition-all text-left
                                            ${isSoldOut
                                                            ? 'border-gray-100 bg-gray-50 opacity-60 cursor-not-allowed'
                                                            : 'border-gray-200 bg-white hover:border-primary/50 hover:shadow-md cursor-pointer'
                                                        }
                                        `}
                                                >
                                                    <div className="flex justify-between w-full items-start mb-2">
                                                        <span className="text-lg font-bold text-gray-900">{bike.name}</span>
                                                    </div>

                                                    <p className="text-sm text-gray-500 mb-4 line-clamp-2">High performance MTB suitable for all trails.</p>

                                                    {isSoldOut ? (
                                                        <Badge variant="secondary">Sold Out</Badge>
                                                    ) : (
                                                        <div className="flex gap-2">
                                                            <Badge variant="outline" className={`${stock < 3 ? "text-orange-600 border-orange-200 bg-orange-50" : "text-gray-600"}`}>
                                                                {stock} available
                                                            </Badge>
                                                        </div>
                                                    )}
                                                </button>
                                            );
                                        })}
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
                                                <div className="space-y-2">
                                                    <Label htmlFor="quantity">Quantity</Label>
                                                    <div className="flex items-center gap-4">
                                                        <Input
                                                            id="quantity"
                                                            type="number"
                                                            min={1}
                                                            max={availability[selectedSlotId]?.[selectedBikeTypeId] || 1}
                                                            {...register("quantity", { valueAsNumber: true })}
                                                            className="w-24"
                                                        />
                                                        <span className="text-sm text-gray-500">
                                                            (Max {availability[selectedSlotId]?.[selectedBikeTypeId] || 0})
                                                        </span>
                                                    </div>
                                                    {errors.quantity && <p className="text-sm text-red-500">{errors.quantity.message}</p>}
                                                </div>
                                            </div>

                                            <div className="bg-gray-50 p-4 rounded-xl text-sm text-gray-600">
                                                By clicking "Request Booking", you agree to our terms of service.
                                                Payment is not required at this stage.
                                            </div>

                                            {/* Released reCAPTCHA component */}

                                            <Button
                                                type="submit"
                                                size="lg"
                                                className="w-full text-lg"
                                                disabled={isSubmitting}
                                                isLoading={isSubmitting}
                                            >
                                                Request Booking
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
                            bikeName={formatBikeName(selectedBikeTypeId)}
                            quantity={watchQuantity}
                            loading={loadingSlots}
                        />
                    )}
                </div>

            </div>
        </div>
    );
}
