import { Client } from "pg";

function getConnectionString() {
  const value =
    process.env.DATABASE_URL ||
    process.env.POSTGRES_PRISMA_URL ||
    process.env.POSTGRES_URL_NON_POOLING ||
    process.env.POSTGRES_URL ||
    process.env.SUPABASE_DATABASE_URL ||
    "";

  return value.replace(/\?sslmode=.*$/, "").replace(/&sslmode=.*$/, "");
}

async function main() {
  const connectionString = getConnectionString();

  if (!connectionString) {
    throw new Error("Database connection string is not configured.");
  }

  const client = new Client({
    connectionString,
    ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : undefined,
  });

  await client.connect();

  try {
    const columnCheck = await client.query(`
      select 1
      from information_schema.columns
      where table_name = 'Tenant'
        and column_name = 'publicSlug'
      limit 1
    `);

    if (columnCheck.rowCount === 0) {
      console.log("Skipping publicSlug backfill because the column does not exist yet.");
      return;
    }

    const result = await client.query(`
      update "Tenant"
      set "publicSlug" = "slug"
      where "publicSlug" is null
    `);

    console.log(`Backfilled publicSlug for ${result.rowCount ?? 0} tenant(s).`);
  } finally {
    await client.end();
  }
}

main().catch((error) => {
  console.error("Failed to backfill publicSlug values.", error);
  process.exit(1);
});
