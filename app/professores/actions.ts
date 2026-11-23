"use server";

import { refresh } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { exigirAdmin } from "@/lib/auth";
import { executar, texto, ErroFormulario, type EstadoAcao } from "@/lib/formulario";

function lerProfessor(formData: FormData) {
  const nome = texto(formData, "nome", "Nome");
  const email = texto(formData, "email", "E-mail", false).toLowerCase() || null;
  const cor = texto(formData, "cor", "Cor");
  if (!/^#[0-9a-fA-F]{6}$/.test(cor)) throw new ErroFormulario("Cor inválida.");
  const ativo = formData.get("ativo") !== null;
  return { nome, email, cor, ativo };
}

export async function criarProfessor(_: EstadoAcao, formData: FormData) {
  await exigirAdmin();
  return executar(async () => {
    const dados = lerProfessor(formData);
    await prisma.professor.create({ data: { ...dados, ativo: true } });
    refresh();
    return `Professor ${dados.nome} cadastrado.`;
  });
}

export async function editarProfessor(id: number, _: EstadoAcao, formData: FormData) {
  await exigirAdmin();
  return executar(async () => {
    await prisma.professor.update({ where: { id }, data: lerProfessor(formData) });
    refresh();
    return "Alterações salvas.";
  });
}

export async function excluirProfessor(id: number): Promise<EstadoAcao> {
  await exigirAdmin();
  const total = await prisma.alocacao.count({ where: { professorId: id } });
  if (total > 0) {
    return {
      erro: `Tem ${total} alocação(ões). Exclua as alocações ou desmarque "Ativo" para esconder o professor.`,
    };
  }
  await prisma.serieAlocacao.deleteMany({ where: { professorId: id } });
  await prisma.professor.delete({ where: { id } });
  redirect("/professores");
}
