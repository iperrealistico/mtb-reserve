import React from "react";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

export type StepItem = {
    id: string;
    label: string;
};

interface BookingStepperProps {
    steps: StepItem[];
    currentStepId: string;
}

export function BookingStepper({ steps, currentStepId }: BookingStepperProps) {
    const currentIdx = steps.findIndex((s) => s.id === currentStepId);

    return (
        <div className="flex w-full items-center py-4">
            {steps.map((step, idx) => {
                const isCompleted = idx < currentIdx;
                const isCurrent = step.id === currentStepId;

                return (
                    <React.Fragment key={step.id}>
                        {/* Step Node */}
                        <div className="flex flex-col items-center relative z-10">
                            <div className={cn(
                                "flex h-8 w-8 items-center justify-center rounded-full border-2 transition-all",
                                isCompleted ? "bg-primary border-primary text-primary-foreground" :
                                    isCurrent ? "border-primary bg-background text-primary" :
                                        "border-gray-200 bg-background text-gray-400"
                            )}>
                                {isCompleted ? <Check className="h-4 w-4" /> : <span className="text-xs font-bold">{idx + 1}</span>}
                            </div>

                            {/* Label - Hide on small mobile */}
                            <span className={cn(
                                "absolute top-10 text-[10px] uppercase font-bold tracking-wider whitespace-nowrap hidden sm:block",
                                isCurrent ? "text-primary" : "text-gray-400"
                            )}>
                                {step.label}
                            </span>
                        </div>

                        {/* Connector Line (except after last item) */}
                        {idx < steps.length - 1 && (
                            <div className={cn(
                                "flex-1 h-[2px] mx-2 rounded-full transition-colors",
                                idx < currentIdx ? "bg-primary" : "bg-gray-200"
                            )} />
                        )}
                    </React.Fragment>
                );
            })}
        </div>
    );
}
