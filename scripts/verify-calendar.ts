
import { db } from "@/lib/db";
import { getDailyBookingsAction } from "@/app/[slug]/admin/(protected)/calendar/actions";
import { randomUUID } from "crypto";

async function main() {
    console.log("🗓️ VERIFYING CALENDAR ACTION...");

    // 1. Setup
    const testSlug = `test-calendar-${randomUUID()}`;
    // Tenant
    await db.tenant.create({
        data: {
            slug: testSlug,
            name: "Calendar Test",
            adminPasswordHash: "mock",
            contactEmail: "test@example.com",
            timezone: "Europe/Rome"
        }
    });

    const bikeType = await db.bikeType.create({
        data: { tenantSlug: testSlug, name: "Bike A", totalStock: 5 }
    });

    // 2. Create Booking for Specific Date (e.g., 2024-10-10)
    // 09:00 Rome -> 07:00 UTC (Winter) or 07:00 UTC (Summer +2 = 09:00, wait, Oct 10 is Summer time? DST ends late Oct).
    // Let's use a safe date.
    const dateStr = "2024-10-10";
    const startTime = new Date("2024-10-10T09:00:00+02:00"); // 09:00 Rome
    const endTime = new Date("2024-10-10T13:00:00+02:00"); // 13:00 Rome

    await db.booking.create({
        data: {
            tenantSlug: testSlug,
            bikeTypeId: bikeType.id,
            status: "CONFIRMED",
            startTime,
            endTime, // UTC
            customerName: "Calendar User",
            customerEmail: "c@test.com",
            customerPhone: "123",
            quantity: 1
        }
    });

    // 3. Call Action
    const result = await getDailyBookingsAction(testSlug, dateStr);

    // 4. Verify
    if (!result.bookings) {
        console.error("❌ Action returned no bookings array");
        process.exit(1);
    }

    console.log(`Found ${result.bookings.length} bookings for ${dateStr}`);

    if (result.bookings.length === 1 && result.bookings[0].customerName === "Calendar User") {
        console.log("✅ Booking found correctly.");
    } else {
        console.error("❌ Booking not found or mismatch.");
        // Log what we found
        console.log(result.bookings);
        process.exit(1);
    }

    // 5. Verify Empty Date
    const emptyDateStr = "2024-10-11";
    const result2 = await getDailyBookingsAction(testSlug, emptyDateStr);

    if (!result2.bookings) {
        console.error("❌ Action returned error for empty date");
        process.exit(1);
    }

    if (result2.bookings.length === 0) {
        console.log("✅ Empty date returns 0 bookings.");
    } else {
        console.error("❌ Empty date returned bookings!");
        process.exit(1);
    }

    // Cleanup
    await db.tenant.delete({ where: { slug: testSlug } });
    console.log("🧹 Cleanup done.");
}

main().catch(e => {
    console.error(e);
    process.exit(1);
});
