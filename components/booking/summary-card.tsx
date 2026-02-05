import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";

interface SummaryCardProps {
    date?: Date;
    slotLabel?: string;
    bikeName?: string;
    quantity?: number;
    loading?: boolean;
    totalPrice?: number;
}

export function SummaryCard({ date, slotLabel, bikeName, quantity, loading, totalPrice }: SummaryCardProps) {
    return (
        <Card className="h-fit sticky top-4 shadow-[0_6px_16px_rgba(0,0,0,0.08)] border-none rounded-2xl">
            <CardHeader className="pb-4">
                <CardTitle className="text-xl font-heading">Your Ride</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Date */}
                <div className="flex justify-between items-start">
                    <span className="text-sm text-gray-500">Date</span>
                    <span className="text-sm font-medium text-right">
                        {date ? format(date, "EEE, MMM do") : <span className="text-gray-300">Select date</span>}
                    </span>
                </div>

                {/* Slot */}
                <div className="flex justify-between items-start">
                    <span className="text-sm text-gray-500">Time</span>
                    <span className="text-sm font-medium text-right">
                        {slotLabel || <span className="text-gray-300">--</span>}
                    </span>
                </div>

                <div className="h-px bg-gray-100 my-2" />

                {/* Bike */}
                <div className="flex justify-between items-start">
                    <span className="text-sm text-gray-500">Bikes</span>
                    <span className="text-sm font-medium text-right flex flex-col items-end">
                        {bikeName ? (
                            <>
                                <span>{quantity}x {bikeName}</span>
                            </>
                        ) : (
                            <span className="text-gray-300">--</span>
                        )}
                    </span>
                </div>

                <div className="h-px bg-gray-100 my-2" />

                {/* Total */}
                <div className="flex justify-between items-center pt-2">
                    <span className="font-bold text-lg">Total</span>
                    <span className="font-bold text-lg text-primary">
                        {totalPrice !== undefined && totalPrice > 0
                            ? `€${totalPrice.toFixed(2)}`
                            : date && slotLabel && bikeName ? "Free" : "--"}
                    </span>
                </div>

                {loading && (
                    <div className="text-xs text-center text-primary animate-pulse mt-2">Updating availability...</div>
                )}
            </CardContent>
        </Card>
    );
}
