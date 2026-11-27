import "server-only";
import { prisma } from "@/lib/prisma";
import { chaveUcTurma, duracaoHoras, formatarHoras } from "@/lib/carga";
import type { Conflito } from "@/lib/conflitos";
import type { Ocorrencia } from "@/lib/recorrencia";

/** Horas já alocadas para cada par UC + turma. Chave: chaveUcTurma(ucId, turmaId). */
export async function horasPorUcTurma(filtro: { ucId?: { in: number[] } } = {}) {
  const aulas = await prisma.alocacao.findMany({
    where: filtro,
    select: { ucId: true, turmaId: true, inicio: true, fim: true },
  });
  const mapa: Record<string, number> = {};
  for (const a of aulas) {
    const chave = chaveUcTurma(a.ucId, a.turmaId);
    mapa[chave] = (mapa[chave] ?? 0) + duracaoHoras(a.inicio, a.fim);
  }
  return mapa;
}

/**
 * Confere se as novas aulas fazem a turma passar da carga horária da UC.
 * Devolve um aviso (no mesmo formato dos conflitos de horário) ou null.
 * `ignorar` exclui aulas que estão sendo editadas.
 */
export async function avisoCargaHoraria(
  novas: Ocorrencia[],
  vinculo: { ucId: number | null; turmaId: number | null; nomeUC: string; cargaNovaUC: number | null },
  ignorar: number[] = [],
): Promise<Conflito | null> {
  const uc = vinculo.ucId ? await prisma.uC.findUnique({ where: { id: vinculo.ucId } }) : null;
  const carga = uc ? uc.cargaHoraria : vinculo.cargaNovaUC;
  if (!carga) return null;

  let jaAlocadas = 0;
  if (vinculo.ucId && vinculo.turmaId) {
    const aulas = await prisma.alocacao.findMany({
      where: { ucId: vinculo.ucId, turmaId: vinculo.turmaId, id: { notIn: ignorar } },
      select: { inicio: true, fim: true },
    });
    jaAlocadas = aulas.reduce((s, a) => s + duracaoHoras(a.inicio, a.fim), 0);
  }
  const novasHoras = novas.reduce((s, o) => s + duracaoHoras(o.inicio, o.fim), 0);
  const total = jaAlocadas + novasHoras;
  // Tolerância de 1 minuto para arredondamentos.
  if (total <= carga + 1 / 60) return null;

  return {
    data: "Carga horária",
    motivo:
      `a UC ${uc?.nome ?? vinculo.nomeUC} tem ${formatarHoras(carga)} e esta turma ficaria com ${formatarHoras(total)} ` +
      `(${formatarHoras(jaAlocadas)} já alocadas + ${formatarHoras(novasHoras)} agora), ` +
      `${formatarHoras(total - carga)} além da carga.`,
  };
}
