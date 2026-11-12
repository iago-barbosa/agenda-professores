// Dados de exemplo para testar o calendário. Rode com: npx prisma db seed
import "dotenv/config";
import { prisma } from "../lib/prisma";
import { gerarOcorrencias, type DadosSerie } from "../lib/recorrencia";

function hoje() {
  return new Date().toISOString().slice(0, 10);
}
function somarDias(data: string, dias: number) {
  const d = new Date(`${data}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + dias);
  return d.toISOString().slice(0, 10);
}

async function main() {
  await prisma.alocacao.deleteMany();
  await prisma.serieAlocacao.deleteMany();
  await prisma.turma.deleteMany();
  await prisma.uC.deleteMany();
  await prisma.curso.deleteMany();
  await prisma.professor.deleteMany();

  const [ana, bruno, carla] = await Promise.all([
    prisma.professor.create({ data: { nome: "Ana Souza", cor: "#0f6cbd" } }),
    prisma.professor.create({ data: { nome: "Bruno Lima", cor: "#c4314b" } }),
    prisma.professor.create({ data: { nome: "Carla Mendes", cor: "#107c10" } }),
  ]);

  const tecnico = await prisma.curso.create({
    data: {
      nome: "Técnico em Desenvolvimento de Sistemas",
      modalidade: "TECNICO",
      ucs: {
        create: [
          { nome: "Lógica de Programação", cargaHoraria: 120 },
          { nome: "Banco de Dados", cargaHoraria: 80 },
        ],
      },
      turmas: { create: [{ codigo: "TDS-2027-1" }] },
    },
    include: { ucs: true, turmas: true },
  });
  const aperf = await prisma.curso.create({
    data: {
      nome: "Aperfeiçoamento em Excel",
      modalidade: "APERFEICOAMENTO",
      ucs: { create: [{ nome: "Excel Avançado", cargaHoraria: 20 }] },
      turmas: { create: [{ codigo: "EXC-01" }] },
    },
    include: { ucs: true, turmas: true },
  });

  const inicio = somarDias(hoje(), -14);
  const series: (DadosSerie & { professorId: number; ucId: number; turmaId: number })[] = [
    { professorId: ana.id, ucId: tecnico.ucs[0].id, turmaId: tecnico.turmas[0].id,
      dataInicio: inicio, dataFim: somarDias(inicio, 90), diasSemana: [1, 3], horaInicio: "08:00", horaFim: "12:00" },
    { professorId: bruno.id, ucId: tecnico.ucs[1].id, turmaId: tecnico.turmas[0].id,
      dataInicio: inicio, dataFim: somarDias(inicio, 60), diasSemana: [2, 4], horaInicio: "19:00", horaFim: "22:00" },
    { professorId: carla.id, ucId: aperf.ucs[0].id, turmaId: aperf.turmas[0].id,
      dataInicio: inicio, dataFim: somarDias(inicio, 30), diasSemana: [6], horaInicio: "08:00", horaFim: "12:00" },
    { professorId: ana.id, ucId: aperf.ucs[0].id, turmaId: aperf.turmas[0].id,
      dataInicio: inicio, dataFim: somarDias(inicio, 30), diasSemana: [5], horaInicio: "13:30", horaFim: "17:30" },
  ];

  for (const s of series) {
    const { professorId, ucId, turmaId } = s;
    await prisma.serieAlocacao.create({
      data: {
        professorId, ucId, turmaId,
        dataInicio: s.dataInicio, dataFim: s.dataFim,
        diasSemana: s.diasSemana.join(","), horaInicio: s.horaInicio, horaFim: s.horaFim,
        alocacoes: {
          create: gerarOcorrencias(s).map((o) => ({ professorId, ucId, turmaId, ...o })),
        },
      },
    });
  }

  console.log(`Seed concluído: ${await prisma.alocacao.count()} alocações criadas.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
