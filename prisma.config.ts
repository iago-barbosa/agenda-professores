import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    // Sem seed automático: os dados de exemplo ficam em `npm run db:exemplo`.
  },
  datasource: {
    url: process.env["DATABASE_URL"],
  },
});
