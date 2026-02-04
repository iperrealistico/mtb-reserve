"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Trash2 } from "lucide-react";
import { updateTenantSettingsAction } from "./actions";
import { TenantSettings, TenantSlot } from "@/lib/tenants";
import { toast } from "sonner"; // Assuming sonner is installed/setup

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
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);

        const formData = new FormData(e.currentTarget);
        // Manually append structured data
        formData.set("slots", JSON.stringify(slots));
        // Checkbox "on" or nothing. We handle state manually so let's enforce it.
        formData.set("fullDayEnabled", fullDayEnabled ? "on" : "off");

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

    return (
        <form onSubmit={handleSubmit} className="space-y-8 max-w-2xl bg-white p-6 rounded-lg shadow">

            <div className="space-y-4">
                <h3 className="text-lg font-medium">Contact Info</h3>
                <div className="grid gap-2">
                    <Label htmlFor="contactEmail">Contact Email</Label>
                    <Input id="contactEmail" name="contactEmail" defaultValue={initialEmail} required />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="contactPhone">Contact Phone</Label>
                    <Input id="contactPhone" name="contactPhone" defaultValue={initialPhone} required />
                </div>
            </div>

            <div className="space-y-4">
                <h3 className="text-lg font-medium flex justify-between items-center">
                    Booking Slots
                    <Button type="button" variant="outline" size="sm" onClick={addSlot}>+ Add Slot</Button>
                </h3>

                <div className="space-y-4">
                    {slots.map((slot, index) => (
                        <div key={slot.id} className="flex gap-4 items-end border p-4 rounded bg-gray-50">
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
                            <Button type="button" variant="destructive" size="icon" onClick={() => removeSlot(index)}>
                                <Trash2 className="w-4 h-4" />
                            </Button>
                        </div>
                    ))}
                </div>

            </div>

            <div className="space-y-4 border-t pt-4">
                <h3 className="text-lg font-medium">Advanced Availability</h3>

                <div className="grid gap-2">
                    <Label htmlFor="minAdvanceHours">Minimum Advance Notice (Hours)</Label>
                    <p className="text-sm text-gray-500">How many hours in advance must a booking be made? (0 = no limit)</p>
                    <Input
                        id="minAdvanceHours"
                        name="minAdvanceHours"
                        type="number"
                        min="0"
                        defaultValue={initialSettings.minAdvanceHours}
                    />
                </div>

                <div className="space-y-2">
                    <Label>Blocked Dates (Yearly/Recurring not supported yet, manual block only)</Label>
                    <p className="text-sm text-gray-500">Enter dates in YYYY-MM-DD format (comma separated for now)</p>
                    <Input
                        name="blockedDates"
                        placeholder="2024-12-25, 2025-01-01"
                        defaultValue={initialSettings.blockedDates?.join(", ")}
                    />
                    {/* Ideally a date picker, but text input is fastest for MVP */}
                </div>
            </div>

            <Button type="submit" disabled={loading}>
                {loading ? "Saving..." : "Save Changes"}
            </Button>
        </form>
    );
}
