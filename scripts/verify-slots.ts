
import { db } from "@/lib/db";
import { getAvailabilityAction } from "@/app/[slug]/actions";
import { randomUUID } from "crypto";

async function main() {
    console.log("⚙️ VERIFYING DYNAMIC SLOT LOGIC...");

    // 1. Create Tenant with Custom Settings
    const testSlug = `test-slots-${randomUUID()}`;
    const customSlots = [
        { id: "slot-a", label: "Slot A (10:00-12:00)", start: "10:00", end: "12:00" },
        { id: "slot-b", label: "Slot B (12:00-14:00)", start: "12:00", end: "14:00" }
    ];

    await db.tenant.create({
        data: {
            slug: testSlug,
            name: "Test Slots Tenant",
            adminPasswordHash: "mock",
            contactEmail: "test@example.com",
            timezone: "Europe/Rome",
            settings: {
                slots: customSlots,
                fullDayEnabled: true
            }
        }
    });

    // 2. Call Availability Action
    const result = await getAvailabilityAction(testSlug, new Date());

    // 3. Verify Slots Returned
    // Should have 3 slots: A, B, and Full Day (10:00-14:00)
    console.log("Returned Slots:", result.slots.map(s => s.id));

    const hasFullDay = result.slots.find(s => s.id === "full-day");
    if (hasFullDay && hasFullDay.start === "10:00" && hasFullDay.end === "14:00") {
        console.log("✅ Full Day slot computed correctly (10:00 - 14:00)");
    } else {
        console.error("❌ Full Day slot incorrect or missing.");
        process.exit(1);
    }

    if (result.slots.length === 3) {
        console.log("✅ Correct number of slots (2 custom + 1 full day)");
    } else {
        console.error(`❌ Expected 3 slots, got ${result.slots.length}`);
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
