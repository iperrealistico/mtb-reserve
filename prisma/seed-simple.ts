const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log("Attempting simple seed...");
    try {
        const tenant = await prisma.tenant.upsert({
            where: { slug: "sillico" },
            update: {},
            create: {
                slug: "sillico",
                name: "Sillico MTB Rental",
                contactEmail: "info@sillico.it",
                adminPasswordHash: "$2b$12$e/y.d.k.j.h.g.f.d.s.a.O", // Mock hash for "password"
                settings: {
                    slots: [{ start: "09:00", end: "13:00" }, { start: "14:00", end: "18:00" }],
                    fullDayEnabled: true,
                    buffer: 0
                }
            }
        });
        console.log("Tenant created:", tenant.slug);

        await prisma.bikeType.createMany({
            data: [
                { tenantSlug: "sillico", name: "Standard MTB", totalStock: 10 },
                { tenantSlug: "sillico", name: "E-Bike Premium", totalStock: 5 }
            ],
            skipDuplicates: true
        });
        console.log("Bikes created");
    } catch (e) {
        console.error("Seed failed:", e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
