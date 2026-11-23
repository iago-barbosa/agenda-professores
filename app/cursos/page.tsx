import { Suspense } from "react";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { exigirAdmin } from "@/lib/auth";
import Cabecalho from "@/app/ui/cabecalho";
import FormularioAcao from "@/app/ui/formulario-acao";
import CamposCurso from "./campos-curso";
import { NOME_MODALIDADE } from "./modalidades";
import { criarCurso } from "./actions";

async function Conteudo() {
  const usuario = await exigirAdmin();
  const cursos = await prisma.curso.findMany({
    orderBy: [{ modalidade: "asc" }, { nome: "asc" }],
    include: { _count: { select: { ucs: true, turmas: true } } },
  });
  return (
    <>
      <Cabecalho usuario={usuario} />
      <h1 className="text-xl font-semibold">Cursos, UCs e turmas</h1>

      <section className="rounded border p-4">
        <h2 className="mb-3 font-semibold">Novo curso</h2>
        <FormularioAcao acao={criarCurso} textoBotao="Cadastrar e adicionar UCs">
          <CamposCurso />
        </FormularioAcao>
      </section>

      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b">
            <th className="py-2">Curso</th>
            <th>Modalidade</th>
            <th>UCs</th>
            <th>Turmas</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {cursos.map((c) => (
            <tr key={c.id} className="border-b">
              <td className="py-2">{c.nome}</td>
              <td>{NOME_MODALIDADE[c.modalidade]}</td>
              <td>{c._count.ucs}</td>
              <td>{c._count.turmas}</td>
              <td className="text-right">
                <Link href={`/cursos/${c.id}`} className="text-[#0f6cbd] underline">
                  Abrir
                </Link>
              </td>
            </tr>
          ))}
          {cursos.length === 0 && (
            <tr>
              <td colSpan={5} className="py-4 text-center opacity-70">
                Nenhum curso cadastrado.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </>
  );
}

export default function PaginaCursos() {
  return (
    <main className="flex flex-1 flex-col gap-4 p-4">
      <Suspense fallback={<p className="text-sm">Carregando…</p>}>
        <Conteudo />
      </Suspense>
    </main>
  );
}
