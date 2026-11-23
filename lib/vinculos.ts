import "server-only";
import { prisma } from "@/lib/prisma";
import { ErroFormulario, inteiro, texto } from "@/lib/formulario";
import type { Modalidade } from "@/app/generated/prisma/client";

const MODALIDADES: Modalidade[] = ["TECNICO", "APRENDIZAGEM", "APERFEICOAMENTO"];

/** Compara nomes ignorando maiúsculas, acentos e espaços extras. */
export function mesmoNome(a: string, b: string) {
  const limpar = (s: string) => s.trim().replace(/\s+/g, " ");
  return limpar(a).localeCompare(limpar(b), "pt-BR", { sensitivity: "base" }) === 0;
}

/**
 * Lê professor, curso, UC e turma digitados no formulário.
 * Curso, UC e turma que ainda não existem são cadastrados quando `criar` é true.
 * Com `criar` false, devolve null nos ids que ainda não existem (útil para checar conflitos antes).
 */
export async function resolverVinculos(formData: FormData, criar: boolean) {
  const professorId = inteiro(formData, "professorId", "Professor")!;
  const nomeCurso = texto(formData, "curso", "Curso");
  const nomeUC = texto(formData, "uc", "UC");
  const codigoTurma = texto(formData, "turma", "Turma");
  const modalidade = String(formData.get("modalidade") ?? "") as Modalidade;
  const cargaHoraria = inteiro(formData, "cargaHoraria", "Carga horária", false);

  const professor = await prisma.professor.findUnique({ where: { id: professorId } });
  if (!professor) throw new ErroFormulario("Professor não encontrado.");

  const cursos = await prisma.curso.findMany({ include: { ucs: true, turmas: true } });
  let curso = cursos.find((c) => mesmoNome(c.nome, nomeCurso));
  let uc = curso?.ucs.find((u) => mesmoNome(u.nome, nomeUC));
  let turma = curso?.turmas.find((t) => mesmoNome(t.codigo, codigoTurma));

  if (curso && !uc && curso.modalidade === "APERFEICOAMENTO" && curso.ucs.length > 0) {
    throw new ErroFormulario(
      `O curso de Aperfeiçoamento "${curso.nome}" já tem a UC "${curso.ucs[0].nome}" e não aceita outra.`,
    );
  }
  if (!curso && !MODALIDADES.includes(modalidade)) {
    throw new ErroFormulario("Curso novo: escolha a modalidade.");
  }

  if (criar) {
    if (!curso) {
      curso = { ...(await prisma.curso.create({ data: { nome: nomeCurso.trim(), modalidade } })), ucs: [], turmas: [] };
    }
    if (!uc) uc = await prisma.uC.create({ data: { nome: nomeUC.trim(), cargaHoraria, cursoId: curso.id } });
    if (!turma) turma = await prisma.turma.create({ data: { codigo: codigoTurma.trim(), cursoId: curso.id } });
  }

  return { professorId, ucId: uc?.id ?? null, turmaId: turma?.id ?? null };
}
