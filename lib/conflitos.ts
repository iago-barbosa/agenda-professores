import "server-only";
import { prisma } from "@/lib/prisma";
import type { Ocorrencia } from "@/lib/recorrencia";

export type Conflito = {
  data: string; // "dd/mm/aaaa hh:mm–hh:mm"
  motivo: string; // ex.: "Ana Souza já está em Banco de Dados (TDS-2027-1)"
};

const formatoData = new Intl.DateTimeFormat("pt-BR", {
  timeZone: "America/Sao_Paulo",
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});
const formatoHora = new Intl.DateTimeFormat("pt-BR", {
  timeZone: "America/Sao_Paulo",
  hour: "2-digit",
  minute: "2-digit",
});

/**
 * Procura alocações existentes que batem no mesmo horário com o mesmo professor ou a mesma turma.
 * `ignorar` exclui alocações que estão sendo editadas.
 */
export async function buscarConflitos(
  ocorrencias: Ocorrencia[],
  professorId: number,
  turmaId: number | null,
  ignorar: number[] = [],
): Promise<Conflito[]> {
  if (ocorrencias.length === 0) return [];
  const inicio = new Date(Math.min(...ocorrencias.map((o) => o.inicio.getTime())));
  const fim = new Date(Math.max(...ocorrencias.map((o) => o.fim.getTime())));

  const existentes = await prisma.alocacao.findMany({
    where: {
      id: { notIn: ignorar },
      inicio: { lt: fim },
      fim: { gt: inicio },
      OR: turmaId ? [{ professorId }, { turmaId }] : [{ professorId }],
    },
    include: { professor: true, uc: true, turma: true },
  });

  const conflitos: Conflito[] = [];
  for (const o of ocorrencias) {
    for (const a of existentes) {
      if (a.inicio < o.fim && a.fim > o.inicio) {
        const quem =
          a.professorId === professorId
            ? `${a.professor.nome} já está em ${a.uc.nome} (turma ${a.turma.codigo})`
            : `A turma ${a.turma.codigo} já tem ${a.uc.nome} com ${a.professor.nome}`;
        conflitos.push({
          data: `${formatoData.format(a.inicio)}–${formatoHora.format(a.fim)}`,
          motivo: quem,
        });
      }
    }
  }
  return conflitos;
}
