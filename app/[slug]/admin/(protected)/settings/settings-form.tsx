"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Trash2, Plus, Calendar } from "lucide-react";
import { updateTenantSettingsAction } from "./actions";
import { TenantSettings, TenantSlot, BlockedDateRange } from "@/lib/tenants";
import { toast } from "sonner";

export default function SettingsForm({
    slug,
    initialEmail,
    initialPhone,
    initialSettings
}: {
    slug: string,
    initialEmail: string,
    initialPhone: string,
    initialSettings: TenantSettings
}) {
    const [fullDayEnabled, setFullDayEnabled] = useState(initialSettings.fullDayEnabled ?? true);
    const [slots, setSlots] = useState<TenantSlot[]>(initialSettings.slots || []);
    const [blockedDateRanges, setBlockedDateRanges] = useState<BlockedDateRange[]>(
        initialSettings.blockedDateRanges || []
    );
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);

        const formData = new FormData(e.currentTarget);
        formData.set("slots", JSON.stringify(slots));
        formData.set("fullDayEnabled", fullDayEnabled ? "on" : "off");
        formData.set("blockedDateRanges", JSON.stringify(blockedDateRanges));

        const result = await updateTenantSettingsAction(slug, formData);

        if (result.success) {
            toast.success("Settings updated");
        } else {
            toast.error(result.error);
        }
        setLoading(false);
    };

    const addSlot = () => {
        const id = `slot-${Date.now()}`;
        setSlots([...slots, { id, label: "New Slot", start: "09:00", end: "10:00" }]);
    };

    const removeSlot = (index: number) => {
        const newSlots = [...slots];
        newSlots.splice(index, 1);
        setSlots(newSlots);
    };

    const updateSlot = (index: number, field: keyof TenantSlot, value: string) => {
        const newSlots = [...slots];
        newSlots[index] = { ...newSlots[index], [field]: value };
        setSlots(newSlots);
    };

    const addBlockedRange = () => {
        const id = `range-${Date.now()}`;
        const today = new Date().toISOString().split('T')[0];
        setBlockedDateRanges([...blockedDateRanges, { id, start: today, end: today, recurringYearly: false }]);
    };

    const removeBlockedRange = (index: number) => {
        const newRanges = [...blockedDateRanges];
        newRanges.splice(index, 1);
        setBlockedDateRanges(newRanges);
    };

    const updateBlockedRange = (index: number, field: keyof BlockedDateRange, value: string | boolean) => {
        const newRanges = [...blockedDateRanges];
        newRanges[index] = { ...newRanges[index], [field]: value };
        setBlockedDateRanges(newRanges);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-8 max-w-2xl">
            {/* Contact Info */}
            <div className="bg-white p-6 rounded-lg shadow space-y-4">
                <h3 className="text-lg font-medium">Contact Info</h3>
                <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                        <Label htmlFor="contactEmail">Contact Email</Label>
                        <Input id="contactEmail" name="contactEmail" type="email" defaultValue={initialEmail} required />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="contactPhone">Contact Phone</Label>
                        <Input id="contactPhone" name="contactPhone" defaultValue={initialPhone} required />
                    </div>
                </div>
            </div>

            {/* Content Customization */}
            <div className="bg-white p-6 rounded-lg shadow space-y-4">
                <h3 className="text-lg font-medium">Content Customization</h3>
                <p className="text-sm text-gray-500">Customize the text shown on your booking page and emails.</p>

                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="bookingTitle">Booking Page Title</Label>
                        <Input
                            id="bookingTitle"
                            name="bookingTitle"
                            defaultValue={initialSettings.content?.bookingTitle}
                            placeholder="e.g., Rent a Bike"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="bookingSubtitle">Booking Page Subtitle</Label>
                        <Input
                            id="bookingSubtitle"
                            name="bookingSubtitle"
                            defaultValue={initialSettings.content?.bookingSubtitle}
                            placeholder="e.g., Choose your bike and date"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="infoBox">Info Box Message</Label>
                        <textarea
                            id="infoBox"
                            name="infoBox"
                            rows={3}
                            defaultValue={initialSettings.content?.infoBox}
                            placeholder="This message appears on the booking page..."
                            className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                        />
                    </div>
                </div>
            </div>

            {/* Pickup Location */}
            <div className="bg-white p-6 rounded-lg shadow space-y-4">
                <h3 className="text-lg font-medium">Pickup Location</h3>
                <p className="text-sm text-gray-500">Google Maps URL for pickup instructions included in confirmation emails.</p>

                <div className="space-y-2">
                    <Label htmlFor="pickupLocationUrl">Google Maps URL</Label>
                    <Input
                        id="pickupLocationUrl"
                        name="pickupLocationUrl"
                        type="url"
                        defaultValue={initialSettings.pickupLocationUrl}
                        placeholder="https://maps.google.com/..."
                    />
                </div>
            </div>

            {/* Booking Slots */}
            <div className="bg-white p-6 rounded-lg shadow space-y-4">
                <div className="flex justify-between items-center">
                    <h3 className="text-lg font-medium">Booking Slots</h3>
                    <Button type="button" variant="outline" size="sm" onClick={addSlot}>
                        <Plus className="w-4 h-4 mr-1" /> Add Slot
                    </Button>
                </div>

                <div className="space-y-4">
                    {slots.map((slot, index) => (
                        <div key={slot.id} className="flex gap-4 items-end border p-4 rounded-lg bg-gray-50">
                            <div className="space-y-1 flex-1">
                                <Label>Label</Label>
                                <Input
                                    value={slot.label}
                                    placeholder="e.g. Morning Selection"
                                    onChange={(e) => updateSlot(index, "label", e.target.value)}
                                />
                            </div>
                            <div className="space-y-1 w-24">
                                <Label>Start</Label>
                                <Input
                                    type="time"
                                    value={slot.start}
                                    onChange={(e) => updateSlot(index, "start", e.target.value)}
                                />
                            </div>
                            <div className="space-y-1 w-24">
                                <Label>End</Label>
                                <Input
                                    type="time"
                                    value={slot.end}
                                    onChange={(e) => updateSlot(index, "end", e.target.value)}
                                />
                            </div>
                            <Button type="button" variant="ghost" size="icon" onClick={() => removeSlot(index)}>
                                <Trash2 className="w-4 h-4 text-gray-500" />
                            </Button>
                        </div>
                    ))}
                </div>

                <div className="flex items-center gap-2 pt-2">
                    <input
                        type="checkbox"
                        id="fullDayEnabled"
                        checked={fullDayEnabled}
                        onChange={(e) => setFullDayEnabled(e.target.checked)}
                        className="rounded"
                    />
                    <Label htmlFor="fullDayEnabled" className="text-sm font-normal">
                        Enable full day option (combines all slots)
                    </Label>
                </div>
            </div>

            {/* Blocked Date Ranges */}
            <div className="bg-white p-6 rounded-lg shadow space-y-4">
                <div className="flex justify-between items-center">
                    <h3 className="text-lg font-medium">Blocked Dates</h3>
                    <Button type="button" variant="outline" size="sm" onClick={addBlockedRange}>
                        <Calendar className="w-4 h-4 mr-1" /> Add Range
                    </Button>
                </div>
                <p className="text-sm text-gray-500">Dates within these ranges will not be available for booking.</p>

                <div className="space-y-4">
                    {blockedDateRanges.map((range, index) => (
                        <div key={range.id} className="flex gap-4 items-end border p-4 rounded-lg bg-gray-50">
                            <div className="space-y-1 flex-1">
                                <Label>Start Date</Label>
                                <Input
                                    type="date"
                                    value={range.start}
                                    onChange={(e) => updateBlockedRange(index, "start", e.target.value)}
                                />
                            </div>
                            <div className="space-y-1 flex-1">
                                <Label>End Date</Label>
                                <Input
                                    type="date"
                                    value={range.end}
                                    onChange={(e) => updateBlockedRange(index, "end", e.target.value)}
                                />
                            </div>
                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id={`recurring-${range.id}`}
                                    checked={range.recurringYearly}
                                    onChange={(e) => updateBlockedRange(index, "recurringYearly", e.target.checked)}
                                    className="rounded"
                                />
                                <Label htmlFor={`recurring-${range.id}`} className="text-sm font-normal whitespace-nowrap">
                                    Yearly
                                </Label>
                            </div>
                            <Button type="button" variant="ghost" size="icon" onClick={() => removeBlockedRange(index)}>
                                <Trash2 className="w-4 h-4 text-gray-500" />
                            </Button>
                        </div>
                    ))}
                    {blockedDateRanges.length === 0 && (
                        <p className="text-sm text-gray-400 italic">No blocked dates configured</p>
                    )}
                </div>

                {/* Legacy blocked dates (comma-separated) */}
                <div className="space-y-2 pt-4 border-t">
                    <Label htmlFor="blockedDates">Additional Blocked Dates (legacy)</Label>
                    <Input
                        id="blockedDates"
                        name="blockedDates"
                        placeholder="2024-12-25, 2025-01-01"
                        defaultValue={initialSettings.blockedDates?.join(", ")}
                    />
                    <p className="text-xs text-gray-500">Comma-separated dates in YYYY-MM-DD format</p>
                </div>
            </div>

            {/* Advance Notice */}
            <div className="bg-white p-6 rounded-lg shadow space-y-4">
                <h3 className="text-lg font-medium">Advance Notice</h3>
                <p className="text-sm text-gray-500">Control how far in advance customers can book.</p>

                <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                        <Label htmlFor="minAdvanceDays">Minimum Days in Advance</Label>
                        <Input
                            id="minAdvanceDays"
                            name="minAdvanceDays"
                            type="number"
                            min="0"
                            defaultValue={initialSettings.minAdvanceDays ?? 0}
                        />
                        <p className="text-xs text-gray-500">0 = same-day booking allowed</p>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="maxAdvanceDays">Maximum Days in Advance</Label>
                        <Input
                            id="maxAdvanceDays"
                            name="maxAdvanceDays"
                            type="number"
                            min="1"
                            defaultValue={initialSettings.maxAdvanceDays ?? 30}
                        />
                        <p className="text-xs text-gray-500">How far in future bookings are allowed</p>
                    </div>
                </div>
            </div>

            <Button type="submit" disabled={loading} className="w-full sm:w-auto">
                {loading ? "Saving..." : "Save Changes"}
            </Button>
        </form>
    );
}
