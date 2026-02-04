
import { db } from "@/lib/db";

async function main() {
    const slug = "sillico"; // Using the user's slug from screenshots
    console.log(`🔍 Debugging Inventory for slug: '${slug}'`);

    const tenant = await db.tenant.findUnique({
        where: { slug },
        include: { bikeTypes: true }
    });

    if (!tenant) {
        console.error("❌ Tenant 'sillico' not found!");
        // List all tenants to see what we have
        const all = await db.tenant.findMany();
        console.log("Available Tenants:", all.map(t => t.slug));
        return;
    }

    console.log(`✅ Tenant found: ${tenant.name}`);
    console.log(`🚴 Bike Types (via include): ${tenant.bikeTypes.length}`);
    tenant.bikeTypes.forEach(b => console.log(` - ${b.name} (Stock: ${b.totalStock})`));

    // Check query used in page.tsx
    const directQuery = await db.bikeType.findMany({
        where: { tenantSlug: slug },
        orderBy: { name: 'asc' }
    });
    console.log(`🚴 Bike Types (via findMany): ${directQuery.length}`);
}

main().catch(console.error);
