import { Client } from 'pg';
import bcrypt from 'bcrypt';

const client = new Client({
    connectionString: process.env.POSTGRES_URL_NON_POOLING || process.env.DATABASE_URL || process.env.POSTGRES_PRISMA_URL || process.env.POSTGRES_URL || process.env.SUPABASE_DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

async function main() {
    try {
        const slug = 'sillico';
        const password = 'swift-river-42';
        // Use a fixed hash to avoid bcrypt import issues or awaiting if needed, 
        // but better to re-hash to be sure it matches the environment's bcrypt version if possible.
        // Actually, let's just use the known hash logic.
        // Hash for 'swift-river-42' with cost 12
        const hashedPassword = await bcrypt.hash(password, 12);

        console.log('Connecting to database...');
        await client.connect();

        console.log('Seeding tenant...');
        const tenantQuery = `
      INSERT INTO "Tenant" (slug, name, "adminPasswordHash", "contactEmail", "settings", "updatedAt")
      VALUES ($1, $2, $3, $4, $5, NOW())
      ON CONFLICT (slug) DO UPDATE SET 
        name = EXCLUDED.name,
        "adminPasswordHash" = EXCLUDED."adminPasswordHash";
    `;

        const settings = JSON.stringify({
            slots: [{ start: "09:00", end: "13:00" }, { start: "14:00", end: "18:00" }],
            fullDayEnabled: true,
            buffer: 0
        });

        await client.query(tenantQuery, [slug, 'Sillico MTB Rental', hashedPassword, 'info@sillico.it', settings]);
        console.log(`Tenant '${slug}' seeded.`);

        console.log('Seeding bike types...');
        // We need to fetch the existing records to avoid duplicates manually or use ON CONFLICT if ID was known.
        // Or just Delete and Recreste for seed? No, unsafe. 
        // Let's just insert one if not exists.

        const bikes = [
            { name: 'Standard MTB', totalStock: 10 },
            { name: 'E-Bike Premium', totalStock: 5 }
        ];

        for (const bike of bikes) {
            // Check if exists
            const check = await client.query('SELECT id FROM "BikeType" WHERE "tenantSlug" = $1 AND name = $2', [slug, bike.name]);
            if (check.rows.length === 0) {
                const insertBike = `
                INSERT INTO "BikeType" (id, "tenantSlug", name, "totalStock", "brokenCount", "updatedAt")
                VALUES (gen_random_uuid(), $1, $2, $3, 0, NOW())
             `;
                // Note: gen_random_uuid() requires pgcrypto or distinct logic. 
                // Actually, Prisma default is cuid(). We can generate a simple random ID here or use a library.
                // Let's use a quick random string function for ID to avoid SQL dependencies.
                const id = 'bike_' + Math.random().toString(36).substr(2, 9);

                await client.query(`
                INSERT INTO "BikeType" (id, "tenantSlug", name, "totalStock", "brokenCount", "updatedAt")
                VALUES ($1, $2, $3, $4, 0, NOW())
             `, [id, slug, bike.name, bike.totalStock]);

                console.log(`Bike '${bike.name}' created.`);
            } else {
                console.log(`Bike '${bike.name}' already exists.`);
            }
        }

        console.log('Seed completed successfully via SQL.');

    } catch (err) {
        console.error('Seed error:', err);
    } finally {
        await client.end();
    }
}

main();
