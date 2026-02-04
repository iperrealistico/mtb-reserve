
import { createZonedDate } from "@/lib/time";

function main() {
    console.log("🌍 VERIFYING TIMEZONE LOGIC...");

    // Test Date: "2024-06-01" (June 1st)
    const baseDate = new Date("2024-06-01T00:00:00.000Z");

    // Case 1: Rome (UTC+2 in Summer)
    // 09:00 Rome = 07:00 UTC
    const romeDate = createZonedDate(baseDate, "09:00", "Europe/Rome");
    const romeHours = romeDate.getUTCHours();
    console.log(`🇮🇹 Rome (Summer) 09:00 -> UTC Hours: ${romeHours} (Expected 7)`);

    // Case 2: London (UTC+1 in Summer)
    // 09:00 London = 08:00 UTC
    const londonDate = createZonedDate(baseDate, "09:00", "Europe/London");
    const londonHours = londonDate.getUTCHours();
    console.log(`🇬🇧 London (Summer) 09:00 -> UTC Hours: ${londonHours} (Expected 8)`);

    // Case 3: New York (UTC-4 in Summer)
    // 09:00 NY = 13:00 UTC
    const nyDate = createZonedDate(baseDate, "09:00", "America/New_York");
    const nyHours = nyDate.getUTCHours();
    console.log(`🇺🇸 New York (Summer) 09:00 -> UTC Hours: ${nyHours} (Expected 13)`);

    if (romeHours === 7 && londonHours === 8 && nyHours === 13) {
        console.log("✅ SUCCESS! Timezone conversion is robust.");
    } else {
        console.error("❌ FAILURE! Timezone conversion mismatch.");
        process.exit(1);
    }
}

main();
