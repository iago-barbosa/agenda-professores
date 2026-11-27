import { PrismaLibSql } from "@prisma/adapter-libsql";
import { PrismaClient } from "@/app/generated/prisma/client";

// Reaproveita a mesma conexão entre recarregamentos em desenvolvimento.
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

/**
 * Em produção (Vercel), usa o banco do Turso (SQLite na nuvem): TURSO_DATABASE_URL + TURSO_AUTH_TOKEN.
 * Em desenvolvimento, usa o arquivo SQLite local de DATABASE_URL (ex.: file:./dev.db).
 */
function criarCliente() {
  const adapter = process.env.TURSO_DATABASE_URL
    ? new PrismaLibSql({
        url: process.env.TURSO_DATABASE_URL,
        authToken: process.env.TURSO_AUTH_TOKEN,
      })
    : new PrismaLibSql({ url: process.env.DATABASE_URL ?? "file:./dev.db" });
  return new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.prisma ?? criarCliente();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
