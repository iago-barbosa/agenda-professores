import { prisma } from "@/lib/prisma";

// GET /api/alocacoes?inicio=ISO&fim=ISO&professores=1,2
// Devolve as alocações no formato de eventos do FullCalendar.
export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const inicio = new Date(params.get("inicio") ?? "");
  const fim = new Date(params.get("fim") ?? "");
  if (Number.isNaN(inicio.getTime()) || Number.isNaN(fim.getTime())) {
    return Response.json({ erro: "Informe inicio e fim válidos." }, { status: 400 });
  }
  const professores = (params.get("professores") ?? "")
    .split(",")
    .map(Number)
    .filter((n) => Number.isInteger(n) && n > 0);

  const alocacoes = await prisma.alocacao.findMany({
    where: {
      inicio: { lt: fim },
      fim: { gt: inicio },
      ...(professores.length ? { professorId: { in: professores } } : {}),
    },
    include: { professor: true, uc: true, turma: true },
    orderBy: { inicio: "asc" },
  });

  return Response.json(
    alocacoes.map((a) => ({
      id: String(a.id),
      title: a.uc.nome,
      start: a.inicio.toISOString(),
      end: a.fim.toISOString(),
      color: a.professor.cor,
      extendedProps: {
        professor: a.professor.nome,
        turma: a.turma.codigo,
        serieId: a.serieId,
      },
    })),
  );
}
