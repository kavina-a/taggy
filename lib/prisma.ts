// Prisma 7 no longer auto-loads .env (see .claude/skills/prisma-upgrade-v7);
// this keeps DATABASE_URL populated for standalone tsx scripts (seed, ad hoc
// checks) that don't go through Next.js's own .env loading.
import "dotenv/config";
import { PrismaClient } from "./generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

// Prisma 7 requires a driver adapter for SQL providers (no bundled Rust
// query engine anymore) — see .claude/skills/prisma-upgrade-v7.
const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

// Guard against hot-reload connection storms in dev: Next.js dev mode
// re-evaluates this module on every edit, which would otherwise open a new
// PrismaClient (and a new pg connection pool) each time.
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ?? new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
