import fs from "node:fs/promises";
import https from "node:https";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { Client } from "pg";

const TABLES = [
  "BikeType",
  "EmailTemplate",
  "Booking",
  "Tenant",
  "AdminLoginAttempt",
  "SuperAdmin",
  "RateLimit",
  "EventLog",
  "SystemSettings",
  "SignupRequest",
  "InboxThread",
  "InboxMessage",
  "InboxAttachment",
  "AboutPageContent",
  "BookingItem",
];

const AUDIT_SQL = `
  with target_tables as (
    select unnest($1::text[]) as table_name
  )
  select
    t.table_name,
    c.relrowsecurity as rls_enabled,
    c.relforcerowsecurity as rls_forced,
    coalesce(
      (
        select count(*)::int
        from pg_policies p
        where p.schemaname = 'public'
          and p.tablename = t.table_name
      ),
      0
    ) as policy_count,
    has_table_privilege('anon', format('%I.%I', 'public', t.table_name), 'SELECT') as anon_select,
    has_table_privilege('anon', format('%I.%I', 'public', t.table_name), 'INSERT') as anon_insert,
    has_table_privilege('anon', format('%I.%I', 'public', t.table_name), 'UPDATE') as anon_update,
    has_table_privilege('anon', format('%I.%I', 'public', t.table_name), 'DELETE') as anon_delete,
    has_table_privilege('authenticated', format('%I.%I', 'public', t.table_name), 'SELECT') as auth_select,
    has_table_privilege('authenticated', format('%I.%I', 'public', t.table_name), 'INSERT') as auth_insert,
    has_table_privilege('authenticated', format('%I.%I', 'public', t.table_name), 'UPDATE') as auth_update,
    has_table_privilege('authenticated', format('%I.%I', 'public', t.table_name), 'DELETE') as auth_delete
  from target_tables t
  join pg_class c on c.relname = t.table_name
  join pg_namespace n on n.oid = c.relnamespace
  where n.nspname = 'public'
  order by t.table_name;
`;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const migrationPaths = [
  "../prisma/manual-migrations/20260423_enable_rls_on_shared_public_tables.sql",
  "../prisma/manual-migrations/20260624_enable_rls_on_inbox_tables.sql",
].map((migrationPath) => path.resolve(__dirname, migrationPath));

function getConnectionString() {
  const raw =
    process.env.POSTGRES_URL_NON_POOLING ||
    process.env.DATABASE_URL ||
    process.env.POSTGRES_PRISMA_URL ||
    process.env.POSTGRES_URL ||
    process.env.SUPABASE_DATABASE_URL;

  if (!raw) {
    throw new Error("No database URL found in environment.");
  }

  return raw.replace(/\?sslmode=.*$/, "").replace(/&sslmode=.*$/, "");
}

async function withClient(fn) {
  const client = new Client({
    connectionString: getConnectionString(),
    ssl: { rejectUnauthorized: false },
  });

  await client.connect();
  try {
    return await fn(client);
  } finally {
    await client.end();
  }
}

async function applyHardening(client) {
  for (const migrationPath of migrationPaths) {
    const sql = await fs.readFile(migrationPath, "utf8");
    await client.query(sql);
  }
}

async function auditDatabase(client) {
  const result = await client.query(AUDIT_SQL, [TABLES]);
  return result.rows;
}

function parseContentRangeCount(contentRange) {
  if (!contentRange) return null;
  const match = contentRange.match(/\/(\d+)$/);
  return match ? Number(match[1]) : null;
}

function restHeadRequest(baseUrl, anonKey, table) {
  return new Promise((resolve, reject) => {
    const url = new URL(`/rest/v1/${encodeURIComponent(table)}?select=*`, baseUrl);
    const request = https.request(
      url,
      {
        method: "HEAD",
        headers: {
          apikey: anonKey,
          Authorization: `Bearer ${anonKey}`,
          Prefer: "count=exact",
        },
      },
      (response) => {
        const result = {
          table,
          status: response.statusCode,
          contentRange: response.headers["content-range"] || null,
          rowCount: parseContentRangeCount(response.headers["content-range"]),
        };
        response.resume();
        response.on("end", () => resolve(result));
      }
    );

    request.on("error", reject);
    request.end();
  });
}

async function checkAnonRestExposure() {
  const baseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const anonKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

  if (!baseUrl || !anonKey) {
    return { skipped: true, reason: "Missing Supabase URL or anon key." };
  }

  const results = [];
  for (const table of TABLES) {
    results.push(await restHeadRequest(baseUrl, anonKey, table));
  }

  return { skipped: false, results };
}

async function main() {
  const apply = process.argv.includes("--apply");

  const audit = await withClient(async (client) => {
    if (apply) {
      await applyHardening(client);
    }
    return auditDatabase(client);
  });

  const rest = await checkAnonRestExposure();
  const insecureTables = audit.filter((row) => !row.rls_enabled).map((row) => row.table_name);
  const anonVisibleTables = rest.skipped
    ? []
    : rest.results
        .filter((row) => row.status === 200 && typeof row.rowCount === "number" && row.rowCount > 0)
        .map((row) => row.table);

  console.log(
    JSON.stringify(
      {
        mode: apply ? "apply" : "check",
        migrationPaths,
        audit,
        rest,
        insecureTables,
        anonVisibleTables,
      },
      null,
      2
    )
  );

  if (insecureTables.length > 0 || anonVisibleTables.length > 0) {
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
