import { z } from "zod";

export const bookingSchema = z.object({
    slug: z.string(),
    date: z.date(), // Client sends Date
    slotId: z.string(), // "morning" | "afternoon" | "full-day"
    bikeTypeId: z.string().optional(),
    quantity: z.number().min(1).max(10).optional(), // Legacy support
    items: z.array(z.object({
        bikeTypeId: z.string(),
        quantity: z.number().min(1)
    })).optional(),
    customerName: z.string().min(2, "Name is required"),
    customerEmail: z.string().email("Invalid email"),
    customerPhone: z.string().min(8, "Phone number is required"), // Basic length check
}).superRefine((data, ctx) => {
    if (!data.items?.length && (!data.bikeTypeId || !data.quantity)) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Must provide items or bikeTypeId/quantity",
            path: ["items"]
        });
    }
});

export type BookingFormData = z.infer<typeof bookingSchema>;
