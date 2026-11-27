import "server-only";
import { prisma } from "@/lib/prisma";
import { horasPorUcTurma } from "@/lib/carga-servidor";

/** Listas usadas nos formulários de alocação (professores, cursos com UCs e turmas). */
export async function carregarCatalogo() {
  const [professores, cursos, horasAlocadas] = await Promise.all([
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
        ucs: { select: { id: true, nome: true, cargaHoraria: true }, orderBy: { nome: "asc" } },
        turmas: { select: { id: true, codigo: true }, orderBy: { codigo: "asc" } },
      },
    }),
    // Horas já alocadas por UC + turma, para mostrar quanto falta da carga horária.
    horasPorUcTurma(),
  ]);
  return { professores, cursos, horasAlocadas };
}

export type Catalogo = Awaited<ReturnType<typeof carregarCatalogo>>;
