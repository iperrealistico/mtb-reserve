import { z } from "zod";

export const bookingSchema = z.object({
    slug: z.string(),
    date: z.date(), // Client sends Date
    slotId: z.string(), // "morning" | "afternoon" | "full-day"
    bikeTypeId: z.string(),
    quantity: z.number().min(1).max(10), // Limit per booking to avoid massive blocks
    customerName: z.string().min(2, "Name is required"),
    customerEmail: z.string().email("Invalid email"),
    customerPhone: z.string().min(8, "Phone number is required"), // Basic length check
});

export type BookingFormData = z.infer<typeof bookingSchema>;
