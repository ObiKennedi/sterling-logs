import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const connectionString = process.env.DATABASE_URL || "";

const adapter = new PrismaPg({ connectionString });

/**
 * Singleton Prisma Client instance for Sterling Logs.
 * Automatically connects to Neon DB (Serverless PostgreSQL) using PrismaPg driver adapter.
 * Prevents multiple active connection pools during Next.js hot-reloads.
 */
export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
    log:
      process.env.NODE_ENV === "development"
        ? ["warn", "error"]
        : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export default prisma;
