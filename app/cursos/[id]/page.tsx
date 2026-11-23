import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { exigirAdmin } from "@/lib/auth";
import Cabecalho from "@/app/ui/cabecalho";
import FormularioAcao from "@/app/ui/formulario-acao";
import BotaoExcluir from "@/app/ui/botao-excluir";
import { campo, rotulo } from "@/app/ui/estilos";
import CamposCurso from "../campos-curso";
import {
  criarTurma,
  criarUC,
  editarCurso,
  editarTurma,
  editarUC,
  excluirCurso,
  excluirTurma,
  excluirUC,
} from "../actions";

async function Conteudo({ params }: { params: Promise<{ id: string }> }) {
  const usuario = await exigirAdmin();
  const id = Number((await params).id);
  const curso = Number.isInteger(id)
    ? await prisma.curso.findUnique({
        where: { id },
        include: {
          ucs: { orderBy: { nome: "asc" } },
          turmas: { orderBy: { codigo: "asc" } },
        },
      })
    : null;
  if (!curso) notFound();
  const podeNovaUC = curso.modalidade !== "APERFEICOAMENTO" || curso.ucs.length === 0;

  return (
    <>
      <Cabecalho usuario={usuario} />
      <Link href="/cursos" className="text-sm text-[#0f6cbd] underline">
        ← Voltar para cursos
      </Link>
      <h1 className="text-xl font-semibold">{curso.nome}</h1>

      <section className="rounded border p-4">
        <h2 className="mb-3 font-semibold">Dados do curso</h2>
        <FormularioAcao acao={editarCurso.bind(null, curso.id)} textoBotao="Salvar curso">
          <CamposCurso curso={curso} />
        </FormularioAcao>
      </section>

      <section className="rounded border p-4">
        <h2 className="mb-3 font-semibold">Unidades curriculares (UCs)</h2>
        <ul className="mb-4 flex flex-col gap-2">
          {curso.ucs.map((uc) => (
            <li key={uc.id} className="flex flex-wrap items-end gap-3 border-b pb-2">
              <FormularioAcao
                acao={editarUC.bind(null, uc.id)}
                textoBotao="Salvar"
                className="flex flex-wrap items-end gap-3"
              >
                <label className={rotulo}>
                  Nome
                  <input name="nome" required defaultValue={uc.nome} className={`${campo} w-72`} />
                </label>
                <label className={rotulo}>
                  Carga horária (h)
                  <input
                    name="cargaHoraria"
                    type="number"
                    min={0}
                    defaultValue={uc.cargaHoraria ?? ""}
                    className={`${campo} w-28`}
                  />
                </label>
              </FormularioAcao>
              <BotaoExcluir acao={excluirUC.bind(null, uc.id)} confirmacao={`Excluir a UC ${uc.nome}?`} />
            </li>
          ))}
          {curso.ucs.length === 0 && <li className="text-sm opacity-70">Nenhuma UC ainda.</li>}
        </ul>
        {podeNovaUC ? (
          <FormularioAcao
            acao={criarUC.bind(null, curso.id)}
            textoBotao="Adicionar UC"
            limparAoSalvar
            className="flex flex-wrap items-end gap-3"
          >
            <label className={rotulo}>
              Nova UC
              <input name="nome" required className={`${campo} w-72`} />
            </label>
            <label className={rotulo}>
              Carga horária (h)
              <input name="cargaHoraria" type="number" min={0} className={`${campo} w-28`} />
            </label>
          </FormularioAcao>
        ) : (
          <p className="text-sm opacity-70">Cursos de Aperfeiçoamento têm uma única UC.</p>
        )}
      </section>

      <section className="rounded border p-4">
        <h2 className="mb-3 font-semibold">Turmas</h2>
        <ul className="mb-4 flex flex-col gap-2">
          {curso.turmas.map((t) => (
            <li key={t.id} className="flex flex-wrap items-end gap-3 border-b pb-2">
              <FormularioAcao
                acao={editarTurma.bind(null, t.id)}
                textoBotao="Salvar"
                className="flex flex-wrap items-end gap-3"
              >
                <label className={rotulo}>
                  Código
                  <input name="codigo" required defaultValue={t.codigo} className={campo} />
                </label>
              </FormularioAcao>
              <BotaoExcluir acao={excluirTurma.bind(null, t.id)} confirmacao={`Excluir a turma ${t.codigo}?`} />
            </li>
          ))}
          {curso.turmas.length === 0 && <li className="text-sm opacity-70">Nenhuma turma ainda.</li>}
        </ul>
        <FormularioAcao
          acao={criarTurma.bind(null, curso.id)}
          textoBotao="Adicionar turma"
          limparAoSalvar
          className="flex flex-wrap items-end gap-3"
        >
          <label className={rotulo}>
            Nova turma (código)
            <input name="codigo" required className={campo} />
          </label>
        </FormularioAcao>
      </section>

      <BotaoExcluir
        acao={excluirCurso.bind(null, curso.id)}
        confirmacao={`Excluir o curso ${curso.nome}, com todas as UCs e turmas?`}
        texto="Excluir curso"
      />
    </>
  );
}

export default function PaginaCurso({ params }: PageProps<"/cursos/[id]">) {
  return (
    <main className="flex flex-1 flex-col gap-4 p-4">
      <Suspense fallback={<p className="text-sm">Carregando…</p>}>
        <Conteudo params={params} />
      </Suspense>
    </main>
  );
}
