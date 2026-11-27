import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { exigirAdmin } from "@/lib/auth";
import Pagina, { Carregando } from "@/app/ui/pagina";
import FormularioAcao from "@/app/ui/formulario-acao";
import BotaoExcluir from "@/app/ui/botao-excluir";
import { campo, rotulo } from "@/app/ui/estilos";
import CamposCurso from "../campos-curso";
import { horasPorUcTurma } from "@/lib/carga-servidor";
import { chaveUcTurma, formatarHoras } from "@/lib/carga";
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
  const horas = await horasPorUcTurma({ ucId: { in: curso.ucs.map((u) => u.id) } });
  const podeNovaUC =
    curso.modalidade !== "APERFEICOAMENTO" || curso.ucs.length === 0;

  return (
    <Pagina
      usuario={usuario}
      titulo={curso.nome}
      acoes={
        <Link href="/cursos" className="botao botao-secundario">
          Voltar
        </Link>
      }
    >
      <section className="cartao">
        <h2 className="cartao-titulo">Dados do curso</h2>
        <FormularioAcao
          acao={editarCurso.bind(null, curso.id)}
          textoBotao="Salvar curso"
        >
          <CamposCurso curso={curso} />
        </FormularioAcao>
      </section>

      <section className="cartao">
        <h2 className="cartao-titulo">Unidades curriculares (UCs)</h2>
        <ul className="mb-4 flex flex-col gap-2">
          {curso.ucs.map((uc) => (
            <li
              key={uc.id}
              className="flex flex-wrap items-end gap-3 border-b border-gray-100 pb-3"
            >
              <FormularioAcao
                acao={editarUC.bind(null, uc.id)}
                textoBotao="Salvar"
                className="flex flex-wrap items-end gap-3"
              >
                <label className={rotulo}>
                  Nome
                  <input
                    name="nome"
                    required
                    defaultValue={uc.nome}
                    className={`${campo} w-72`}
                  />
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
              <BotaoExcluir
                acao={excluirUC.bind(null, uc.id)}
                confirmacao={`Excluir a UC ${uc.nome}?`}
              />
              {curso.turmas.length > 0 && (
                <div className="flex w-full flex-wrap items-center gap-2 text-xs">
                  <span className="text-gray-500">Horas alocadas por turma:</span>
                  {curso.turmas.map((t) => {
                    const h = horas[chaveUcTurma(uc.id, t.id)] ?? 0;
                    const carga = uc.cargaHoraria;
                    const cor = !carga
                      ? "bg-gray-100 text-gray-600"
                      : h > carga + 1 / 60
                        ? "bg-red-50 text-red-700"
                        : h >= carga - 1 / 60
                          ? "bg-green-50 text-green-700"
                          : "bg-amber-50 text-amber-800";
                    return (
                      <span key={t.id} className={`selo ${cor}`}>
                        {t.codigo}: {formatarHoras(h)}
                        {carga ? ` / ${formatarHoras(carga)}` : ""}
                      </span>
                    );
                  })}
                </div>
              )}
            </li>
          ))}
          {curso.ucs.length === 0 && (
            <li className="text-sm text-gray-500">Nenhuma UC ainda.</li>
          )}
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
              <input
                name="cargaHoraria"
                type="number"
                min={0}
                className={`${campo} w-28`}
              />
            </label>
          </FormularioAcao>
        ) : (
          <p className="text-sm text-gray-500">
            Cursos de Aperfeiçoamento têm uma única UC.
          </p>
        )}
      </section>

      <section className="cartao">
        <h2 className="cartao-titulo">Turmas</h2>
        <ul className="mb-4 flex flex-col gap-2">
          {curso.turmas.map((t) => (
            <li
              key={t.id}
              className="flex flex-wrap items-end gap-3 border-b border-gray-100 pb-3"
            >
              <FormularioAcao
                acao={editarTurma.bind(null, t.id)}
                textoBotao="Salvar"
                className="flex flex-wrap items-end gap-3"
              >
                <label className={rotulo}>
                  Código
                  <input
                    name="codigo"
                    required
                    defaultValue={t.codigo}
                    className={campo}
                  />
                </label>
              </FormularioAcao>
              <BotaoExcluir
                acao={excluirTurma.bind(null, t.id)}
                confirmacao={`Excluir a turma ${t.codigo}?`}
              />
            </li>
          ))}
          {curso.turmas.length === 0 && (
            <li className="text-sm text-gray-500">Nenhuma turma ainda.</li>
          )}
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

      <section className="cartao">
        <h2 className="cartao-titulo">Excluir curso</h2>
        <p className="mb-3 text-sm text-gray-500">
          Remove o curso com todas as UCs e turmas.
        </p>
        <BotaoExcluir
          acao={excluirCurso.bind(null, curso.id)}
          confirmacao={`Excluir o curso ${curso.nome}, com todas as UCs e turmas?`}
          texto="Excluir curso"
        />
      </section>
    </Pagina>
  );
}

export default function PaginaCurso({ params }: PageProps<"/cursos/[id]">) {
  return (
    <Suspense fallback={<Carregando />}>
      <Conteudo params={params} />
    </Suspense>
  );
}
