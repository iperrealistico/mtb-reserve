import { PrismaClient } from "@prisma/client";
import { hashPassword } from "../lib/auth"; // Relative path might be tricky with ts-node, but tsx handles it if configured
// If relative import fails in seed, I might need to copy hash logic or adjust tsconfig. 
// For simplicity in seed, I will use bcrypt directly here to avoid path alias issues during seed execution outside of Next.js context.
const bcrypt = require("bcrypt");

const prisma = new PrismaClient({
    log: ["error", "warn"],
});

async function main() {
    const slug = "sillico";
    const password = "swift-river-42";
    const hashedPassword = await bcrypt.hash(password, 12);

    console.log(`Seeding tenant '${slug}'...`);

    const tenant = await prisma.tenant.upsert({
        where: { slug },
        update: {},
        create: {
            slug,
            name: "Sillico MTB Rental",
            contactEmail: "info@sillico.it",
            adminPasswordHash: hashedPassword,
            settings: {
                slots: [
                    { start: "09:00", end: "13:00" },
                    { start: "14:00", end: "18:00" }
                ],
                fullDayEnabled: true,
                buffer: 0
            }
        },
    });

    console.log(`Tenant '${slug}' created with password: '${password}'`);

    // Create default Bike Type
    await prisma.bikeType.createMany({
        data: [
            {
                tenantSlug: slug,
                name: "Standard MTB",
                totalStock: 10,
                brokenCount: 0
            },
            {
                tenantSlug: slug,
                name: "E-Bike Premium",
                totalStock: 5,
                brokenCount: 0
            }
        ],
        skipDuplicates: true,
    });

    console.log("Seeding finished.");
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
