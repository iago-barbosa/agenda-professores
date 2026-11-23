"use server";

import { refresh } from "next/cache";
import { prisma } from "@/lib/prisma";
import { exigirAdmin } from "@/lib/auth";
import { buscarConflitos } from "@/lib/conflitos";
import { dataHoraLocal, gerarOcorrencias, validarSerie } from "@/lib/recorrencia";
import { executar, inteiro, texto, ErroFormulario, type EstadoAcao } from "@/lib/formulario";
import { resolverVinculos } from "@/lib/vinculos";

/** Cadastra curso, UC e turma novos (se for o caso) e devolve os ids. */
async function comIds(formData: FormData) {
  const v = await resolverVinculos(formData, true);
  // Atualiza as sugestões dos campos (curso/UC/turma recém-cadastrados).
  refresh();
  return { professorId: v.professorId, ucId: v.ucId!, turmaId: v.turmaId! };
}

const querConfirmar = (formData: FormData) => formData.get("confirmarConflitos") === null;

/** Cria uma alocação avulsa ou edita uma existente (só aquela data, mesmo se fizer parte de um lote). */
export async function salvarAlocacao(_: EstadoAcao, formData: FormData) {
  await exigirAdmin();
  return executar(async () => {
    const id = inteiro(formData, "id", "Alocação", false);
    const previa = await resolverVinculos(formData, false);
    const data = texto(formData, "data", "Data");
    const horaInicio = texto(formData, "horaInicio", "Hora de início");
    const horaFim = texto(formData, "horaFim", "Hora de fim");
    const erros = validarSerie({ dataInicio: data, dataFim: data, diasSemana: [0], horaInicio, horaFim });
    if (erros.length) throw new ErroFormulario(erros[0]);

    const ocorrencia = { inicio: dataHoraLocal(data, horaInicio), fim: dataHoraLocal(data, horaFim) };
    if (querConfirmar(formData)) {
      const conflitos = await buscarConflitos([ocorrencia], previa.professorId, previa.turmaId, id ? [id] : []);
      if (conflitos.length) return { conflitos };
    }
    const vinculos = await comIds(formData);

    if (id) {
      await prisma.alocacao.update({ where: { id }, data: { ...vinculos, ...ocorrencia } });
      return "Alocação salva.";
    }
    await prisma.alocacao.create({ data: { ...vinculos, ...ocorrencia } });
    return "Alocação criada.";
  });
}

/** Exclui só esta alocação ou toda a série (lote) a que ela pertence. */
export async function excluirAlocacao(id: number, escopo: "uma" | "serie"): Promise<EstadoAcao> {
  await exigirAdmin();
  const alocacao = await prisma.alocacao.findUnique({ where: { id } });
  if (!alocacao) return { erro: "Alocação não encontrada." };
  if (escopo === "serie" && alocacao.serieId) {
    const { count } = await prisma.alocacao.deleteMany({ where: { serieId: alocacao.serieId } });
    await prisma.serieAlocacao.delete({ where: { id: alocacao.serieId } });
    return { ok: `${count} aula(s) da série excluída(s).`, versao: Date.now() };
  }
  await prisma.alocacao.delete({ where: { id } });
  return { ok: "Alocação excluída.", versao: Date.now() };
}

/** Alocação em lote: uma UC para um professor, nos dias da semana escolhidos, entre duas datas. */
export async function criarLote(_: EstadoAcao, formData: FormData) {
  await exigirAdmin();
  return executar(async () => {
    const previa = await resolverVinculos(formData, false);
    const serie = {
      dataInicio: texto(formData, "dataInicio", "Data de início"),
      dataFim: texto(formData, "dataFim", "Data de fim"),
      diasSemana: formData.getAll("dias").map(Number),
      horaInicio: texto(formData, "horaInicio", "Hora de início"),
      horaFim: texto(formData, "horaFim", "Hora de fim"),
    };
    const erros = validarSerie(serie);
    if (erros.length) throw new ErroFormulario(erros.join(" "));

    const ocorrencias = gerarOcorrencias(serie);
    if (ocorrencias.length === 0) {
      throw new ErroFormulario("Nenhuma data do período cai nos dias da semana escolhidos.");
    }
    if (ocorrencias.length > 500) {
      throw new ErroFormulario(`O lote geraria ${ocorrencias.length} aulas. O limite é 500 por vez.`);
    }

    if (querConfirmar(formData)) {
      const conflitos = await buscarConflitos(ocorrencias, previa.professorId, previa.turmaId);
      if (conflitos.length) return { conflitos };
    }
    const vinculos = await comIds(formData);

    await prisma.serieAlocacao.create({
      data: {
        ...vinculos,
        dataInicio: serie.dataInicio,
        dataFim: serie.dataFim,
        diasSemana: serie.diasSemana.join(","),
        horaInicio: serie.horaInicio,
        horaFim: serie.horaFim,
        alocacoes: { create: ocorrencias.map((o) => ({ ...vinculos, ...o })) },
      },
    });
    return `${ocorrencias.length} aula(s) criada(s).`;
  });
}
