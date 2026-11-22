import "server-only";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";
import { env } from "@/lib/env";
import { withVerifiedSsl } from "./database-url";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter: new PrismaPg({ connectionString: withVerifiedSsl(env.DATABASE_URL) }),
  });

if (env.NODE_ENV !== "production") {
  globalForPrisma.prisma = db;
}
