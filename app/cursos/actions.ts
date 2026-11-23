"use server";

import { refresh } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { exigirAdmin } from "@/lib/auth";
import { executar, inteiro, texto, ErroFormulario, type EstadoAcao } from "@/lib/formulario";
import type { Modalidade } from "@/app/generated/prisma/client";

const MODALIDADES: Modalidade[] = ["TECNICO", "APRENDIZAGEM", "APERFEICOAMENTO"];

function lerCurso(formData: FormData) {
  const nome = texto(formData, "nome", "Nome");
  const modalidade = texto(formData, "modalidade", "Modalidade") as Modalidade;
  if (!MODALIDADES.includes(modalidade)) throw new ErroFormulario("Modalidade inválida.");
  return { nome, modalidade };
}

// ---------- Curso ----------

export async function criarCurso(_: EstadoAcao, formData: FormData): Promise<EstadoAcao> {
  await exigirAdmin();
  let id = 0;
  const r = await executar(async () => {
    id = (await prisma.curso.create({ data: lerCurso(formData) })).id;
    return "ok";
  });
  if (r.erro) return r;
  redirect(`/cursos/${id}`); // segue para cadastrar UCs e turmas
}

export async function editarCurso(id: number, _: EstadoAcao, formData: FormData) {
  await exigirAdmin();
  return executar(async () => {
    const dados = lerCurso(formData);
    if (dados.modalidade === "APERFEICOAMENTO") {
      const ucs = await prisma.uC.count({ where: { cursoId: id } });
      if (ucs > 1) throw new ErroFormulario("Aperfeiçoamento tem uma única UC, e este curso tem mais.");
    }
    await prisma.curso.update({ where: { id }, data: dados });
    refresh();
    return "Curso salvo.";
  });
}

export async function excluirCurso(id: number): Promise<EstadoAcao> {
  await exigirAdmin();
  const total = await prisma.alocacao.count({
    where: { OR: [{ uc: { cursoId: id } }, { turma: { cursoId: id } }] },
  });
  if (total > 0) return { erro: `O curso tem ${total} alocação(ões). Exclua-as antes.` };
  await prisma.serieAlocacao.deleteMany({
    where: { OR: [{ uc: { cursoId: id } }, { turma: { cursoId: id } }] },
  });
  await prisma.curso.delete({ where: { id } }); // UCs e turmas vão junto
  redirect("/cursos");
}

// ---------- UC ----------

function lerUC(formData: FormData) {
  return {
    nome: texto(formData, "nome", "Nome da UC"),
    cargaHoraria: inteiro(formData, "cargaHoraria", "Carga horária", false),
  };
}

export async function criarUC(cursoId: number, _: EstadoAcao, formData: FormData) {
  await exigirAdmin();
  return executar(async () => {
    const curso = await prisma.curso.findUniqueOrThrow({
      where: { id: cursoId },
      include: { _count: { select: { ucs: true } } },
    });
    if (curso.modalidade === "APERFEICOAMENTO" && curso._count.ucs >= 1) {
      throw new ErroFormulario("Cursos de Aperfeiçoamento têm uma única UC.");
    }
    await prisma.uC.create({ data: { ...lerUC(formData), cursoId } });
    refresh();
    return "UC cadastrada.";
  });
}

export async function editarUC(id: number, _: EstadoAcao, formData: FormData) {
  await exigirAdmin();
  return executar(async () => {
    await prisma.uC.update({ where: { id }, data: lerUC(formData) });
    refresh();
    return "UC salva.";
  });
}

export async function excluirUC(id: number): Promise<EstadoAcao> {
  await exigirAdmin();
  const total = await prisma.alocacao.count({ where: { ucId: id } });
  if (total > 0) return { erro: `Tem ${total} alocação(ões).` };
  await prisma.serieAlocacao.deleteMany({ where: { ucId: id } });
  await prisma.uC.delete({ where: { id } });
  refresh();
  return {};
}

// ---------- Turma ----------

export async function criarTurma(cursoId: number, _: EstadoAcao, formData: FormData) {
  await exigirAdmin();
  return executar(async () => {
    await prisma.turma.create({ data: { codigo: texto(formData, "codigo", "Código"), cursoId } });
    refresh();
    return "Turma cadastrada.";
  });
}

export async function editarTurma(id: number, _: EstadoAcao, formData: FormData) {
  await exigirAdmin();
  return executar(async () => {
    await prisma.turma.update({ where: { id }, data: { codigo: texto(formData, "codigo", "Código") } });
    refresh();
    return "Turma salva.";
  });
}

export async function excluirTurma(id: number): Promise<EstadoAcao> {
  await exigirAdmin();
  const total = await prisma.alocacao.count({ where: { turmaId: id } });
  if (total > 0) return { erro: `Tem ${total} alocação(ões).` };
  await prisma.serieAlocacao.deleteMany({ where: { turmaId: id } });
  await prisma.turma.delete({ where: { id } });
  refresh();
  return {};
}
