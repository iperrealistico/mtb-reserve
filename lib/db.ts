import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';

// Strip sslmode from the connection string to allow the ssl object to take precedence
const connectionString = `${process.env.DATABASE_URL || process.env.POSTGRES_PRISMA_URL || process.env.POSTGRES_URL_NON_POOLING || process.env.POSTGRES_URL || process.env.SUPABASE_DATABASE_URL}`.replace(/\?sslmode=.*$/, "").replace(/&sslmode=.*$/, "");

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  pool: Pool | undefined;
};

// Strict singleton: Only initialize pool and client if they don't exist in global space
if (!globalForPrisma.prisma) {
  const pool = new Pool({
    connectionString,
    max: 1, // Only 1 connection per instance to avoid Neon session limits
    idleTimeoutMillis: 10000,
    connectionTimeoutMillis: 10000,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : undefined
  });

  const adapter = new PrismaPg(pool);

  globalForPrisma.pool = pool;
  globalForPrisma.prisma = new PrismaClient({
    adapter,
    log: ["error", "warn"],
  });
}

export const db = globalForPrisma.prisma!;
