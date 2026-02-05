
import { db } from "@/lib/db";

async function diagnose() {
    console.log("Diagnosing DB Connection...");

    // 1. Check if we can connect
    try {
        await db.$connect();
        console.log("✅ Database connected successfully.");
    } catch (e: any) {
        console.error("❌ Failed to connect to DB:", e.message);
        process.exit(1);
    }

    // 2. Check SuperAdmin count
    try {
        const count = await db.superAdmin.count();
        console.log(`✅ SuperAdmin Count: ${count}`);

        if (count > 0) {
            const admin = await db.superAdmin.findFirst();
            console.log(`✅ Found Admin: ${admin?.email} with ID: ${admin?.id}`);
        } else {
            console.error("❌ No Super Admin found in this database.");
        }

    } catch (e: any) {
        console.error("❌ Failed to query SuperAdmin:", e.message);
    }
}

diagnose()
    .catch(console.error)
    .finally(() => db.$disconnect());
