// Aplica as migrações do Prisma (prisma/migrations) no banco do Turso.
// O `prisma migrate deploy` não fala com o Turso, por isso este script.
// Uso (com TURSO_DATABASE_URL e TURSO_AUTH_TOKEN no .env):
//   npm run db:migrar-turso
// Só aplica as migrações que ainda não foram aplicadas; pode rodar quantas vezes quiser.
import "dotenv/config";
import { readdirSync, readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { createClient } from "@libsql/client";

const PASTA = join(process.cwd(), "prisma", "migrations");

async function main() {
  const url = process.env.TURSO_DATABASE_URL;
  if (!url) throw new Error("Defina TURSO_DATABASE_URL (e TURSO_AUTH_TOKEN) no .env.");
  const banco = createClient({ url, authToken: process.env.TURSO_AUTH_TOKEN });

  await banco.execute(
    "CREATE TABLE IF NOT EXISTS _migracoes (nome TEXT PRIMARY KEY, aplicadaEm TEXT NOT NULL)",
  );
  const feitas = new Set(
    (await banco.execute("SELECT nome FROM _migracoes")).rows.map((r) => String(r.nome)),
  );

  const migracoes = readdirSync(PASTA, { withFileTypes: true })
    .filter((d) => d.isDirectory() && existsSync(join(PASTA, d.name, "migration.sql")))
    .map((d) => d.name)
    .sort();

  let aplicadas = 0;
  for (const nome of migracoes) {
    if (feitas.has(nome)) continue;
    const sql = readFileSync(join(PASTA, nome, "migration.sql"), "utf8");
    console.log(`Aplicando ${nome}…`);
    await banco.executeMultiple(sql);
    await banco.execute({
      sql: "INSERT INTO _migracoes (nome, aplicadaEm) VALUES (?, ?)",
      args: [nome, new Date().toISOString()],
    });
    aplicadas++;
  }
  console.log(aplicadas ? `${aplicadas} migração(ões) aplicada(s).` : "O banco já está atualizado.");
  banco.close();
}

main().catch((e) => {
  console.error(e instanceof Error ? e.message : e);
  process.exit(1);
});
