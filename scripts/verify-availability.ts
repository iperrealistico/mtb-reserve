
import { db } from "@/lib/db";
import { getBikeAvailability } from "@/lib/availability";
import { randomUUID } from "crypto";
import { addHours, subHours } from "date-fns";

async function main() {
    console.log("🧪 STARTING AVAILABILITY VERIFICATION...");

    // 1. Setup Test Data
    const testSlug = `test-avail-${randomUUID()}`;
    const tenant = await db.tenant.create({
        data: {
            slug: testSlug,
            name: "Test Tenant",
            adminPasswordHash: "mock",
            contactEmail: "test@example.com",
            timezone: "Europe/Rome"
        }
    });

    const bikeType = await db.bikeType.create({
        data: {
            tenantSlug: testSlug,
            name: "Test Bike",
            totalStock: 3,
            brokenCount: 0
        }
    });

    console.log(`✅ Created Tenant ${testSlug} and BikeType ${bikeType.id} (Stock: 3)`);

    const now = new Date();
    // Use tomorrow to avoid timezone edge cases for this specific test
    // We just want to test the "expired" logic, not timezones yet
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + 1);
    targetDate.setHours(0, 0, 0, 0);

    const startTime = new Date(targetDate);
    startTime.setHours(9, 0, 0, 0);
    const endTime = new Date(targetDate);
    endTime.setHours(13, 0, 0, 0);

    // 2. Create Bookings

    // A: CONFIRMED (Should Count)
    await db.booking.create({
        data: {
            tenantSlug: testSlug,
            bikeTypeId: bikeType.id,
            status: "CONFIRMED",
            startTime,
            endTime,
            customerName: "Confirmed User",
            customerEmail: "c@test.com",
            customerPhone: "123",
            quantity: 1
        }
    });

    // B: PENDING & VALID (Should Count)
    await db.booking.create({
        data: {
            tenantSlug: testSlug,
            bikeTypeId: bikeType.id,
            status: "PENDING_CONFIRM",
            startTime,
            endTime,
            customerName: "Pending Valid",
            customerEmail: "p@test.com",
            customerPhone: "123",
            quantity: 1,
            confirmationToken: randomUUID(),
            expiresAt: addHours(new Date(), 1) // Expires in 1 hour
        }
    });

    // C: PENDING & EXPIRED (Should NOT Count)
    await db.booking.create({
        data: {
            tenantSlug: testSlug,
            bikeTypeId: bikeType.id,
            status: "PENDING_CONFIRM",
            startTime,
            endTime,
            customerName: "Pending Expired",
            customerEmail: "e@test.com",
            customerPhone: "123",
            quantity: 1,
            confirmationToken: randomUUID(),
            expiresAt: subHours(new Date(), 1) // Expired 1 hour ago
        }
    });

    console.log("✅ Created 3 bookings: 1 Confirmed, 1 Pending(Valid), 1 Pending(Expired)");

    // 3. Verify Availability
    // Stock = 3
    // Used = 1 (Conf) + 1 (Valid) = 2
    // Expired should be ignored
    // Expected Result: 1 Available

    const result = await getBikeAvailability(testSlug, targetDate, "09:00", "13:00");
    const available = result[bikeType.id];

    console.log(`\n🧐 Availability Check Result: ${available} (Expected: 1)`);

    if (available === 1) {
        console.log("✅ SUCCESS! Expired booking was correctly ignored.");
    } else {
        console.error(`❌ FAILURE! Expected 1, got ${available}. Logic error.`);
        process.exit(1);
    }

    // 4. Cleanup
    await db.tenant.delete({ where: { slug: testSlug } });
    console.log("🧹 Cleanup complete.");
}

main().catch(e => {
    console.error(e);
    process.exit(1);
});
