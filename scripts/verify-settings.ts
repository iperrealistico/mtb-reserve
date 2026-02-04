
import { db } from "@/lib/db";
import { updateTenantSettingsAction } from "@/app/[slug]/admin/(protected)/settings/actions";
import { randomUUID } from "crypto";

async function main() {
    console.log("⚙️ VERIFYING SETTINGS ACTION...");

    // 1. Setup
    const testSlug = `test-settings-${randomUUID()}`;
    await db.tenant.create({
        data: {
            slug: testSlug,
            name: "Settings Test",
            adminPasswordHash: "mock",
            contactEmail: "old@test.com",
            timezone: "Europe/Rome"
        }
    });

    // 2. Call Update Action
    const formData = new FormData();
    formData.set("contactEmail", "new@test.com");
    formData.set("contactPhone", "555-0199");

    // Custom slots
    const slots = [
        { id: "custom-1", label: "Custom 1", start: "10:00", end: "11:00" }
    ];
    formData.set("slots", JSON.stringify(slots));
    formData.set("fullDayEnabled", "on");

    const result = await updateTenantSettingsAction(testSlug, formData);

    if (result.error) {
        console.error("❌ Update failed:", result.error);
        process.exit(1);
    }

    // 3. Verify Persistence
    const updated = await db.tenant.findUnique({ where: { slug: testSlug } });
    if (!updated) throw new Error("Tenant vanished");

    if (updated.contactEmail === "new@test.com" && updated.contactPhone === "555-0199") {
        console.log("✅ Contact info updated.");
    } else {
        console.error("❌ Contact info mismatch.");
        process.exit(1);
    }

    const settings = updated.settings as any;
    if (settings && settings.slots && settings.slots.length === 1 && settings.fullDayEnabled === true) {
        console.log("✅ Settings JSON updated correctly.");
    } else {
        console.error("❌ Settings JSON mismatch.");
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
