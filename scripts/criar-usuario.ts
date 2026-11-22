// Cria ou atualiza um usuário.
// Uso:
//   npm run usuario:criar -- --nome "Fulano" --email fulano@escola.com --senha "minhaSenha123" --papel ADMIN
//   npm run usuario:criar -- --nome "Ana" --email ana@escola.com --senha "outraSenha1" --papel PROFESSOR --professor 1
// Se o e-mail já existir, atualiza nome, senha, papel e professor.
import "dotenv/config";
import { parseArgs } from "node:util";
import { prisma } from "../lib/prisma";
import { gerarHashSenha, TAMANHO_MINIMO_SENHA } from "../lib/senha";

async function main() {
  const { values } = parseArgs({
    options: {
      nome: { type: "string" },
      email: { type: "string" },
      senha: { type: "string" },
      papel: { type: "string", default: "PROFESSOR" },
      professor: { type: "string" },
    },
  });

  const nome = values.nome?.trim();
  const email = values.email?.trim().toLowerCase();
  const senha = values.senha ?? "";
  const papel = values.papel?.toUpperCase();
  const professorId = values.professor ? Number(values.professor) : null;

  if (!nome || !email) throw new Error("Informe --nome e --email.");
  if (senha.length < TAMANHO_MINIMO_SENHA)
    throw new Error(`A senha precisa ter pelo menos ${TAMANHO_MINIMO_SENHA} caracteres.`);
  if (papel !== "ADMIN" && papel !== "PROFESSOR")
    throw new Error("--papel precisa ser ADMIN ou PROFESSOR.");
  if (professorId !== null) {
    const existe = await prisma.professor.findUnique({ where: { id: professorId } });
    if (!existe) throw new Error(`Professor ${professorId} não encontrado.`);
  }

  const dados = { nome, senhaHash: await gerarHashSenha(senha), papel, professorId } as const;
  const usuario = await prisma.usuario.upsert({
    where: { email },
    create: { email, ...dados },
    update: dados,
  });
  console.log(`Usuário salvo: ${usuario.nome} <${usuario.email}> (${usuario.papel}).`);
}

main()
  .catch((e) => {
    console.error(e instanceof Error ? e.message : e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
