import "server-only";
import { prisma } from "@/lib/prisma";

/** Listas usadas nos formulários de alocação (professores, cursos com UCs e turmas). */
export async function carregarCatalogo() {
  const [professores, cursos] = await Promise.all([
    prisma.professor.findMany({
      where: { ativo: true },
      select: { id: true, nome: true, cor: true },
      orderBy: { nome: "asc" },
    }),
    prisma.curso.findMany({
      orderBy: { nome: "asc" },
      select: {
        id: true,
        nome: true,
        modalidade: true,
        ucs: { select: { id: true, nome: true }, orderBy: { nome: "asc" } },
        turmas: { select: { id: true, codigo: true }, orderBy: { codigo: "asc" } },
      },
    }),
  ]);
  return { professores, cursos };
}

export type Catalogo = Awaited<ReturnType<typeof carregarCatalogo>>;
