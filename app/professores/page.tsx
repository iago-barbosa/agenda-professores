import { Suspense } from "react";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { exigirAdmin } from "@/lib/auth";
import Cabecalho from "@/app/ui/cabecalho";
import FormularioAcao from "@/app/ui/formulario-acao";
import CamposProfessor from "./campos";
import { criarProfessor } from "./actions";

async function Conteudo() {
  const usuario = await exigirAdmin();
  const professores = await prisma.professor.findMany({
    orderBy: { nome: "asc" },
    include: { _count: { select: { alocacoes: true } } },
  });
  return (
    <>
      <Cabecalho usuario={usuario} />
      <h1 className="text-xl font-semibold">Professores</h1>

      <section className="rounded border p-4">
        <h2 className="mb-3 font-semibold">Novo professor</h2>
        <FormularioAcao acao={criarProfessor} textoBotao="Cadastrar" limparAoSalvar>
          <CamposProfessor />
        </FormularioAcao>
      </section>

      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b">
            <th className="py-2">Nome</th>
            <th>E-mail</th>
            <th>Alocações</th>
            <th>Situação</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {professores.map((p) => (
            <tr key={p.id} className="border-b">
              <td className="py-2">
                <span className="mr-2 inline-block h-3 w-3 rounded-sm" style={{ background: p.cor }} />
                {p.nome}
              </td>
              <td>{p.email ?? "—"}</td>
              <td>{p._count.alocacoes}</td>
              <td>{p.ativo ? "Ativo" : "Inativo"}</td>
              <td className="text-right">
                <Link href={`/professores/${p.id}`} className="text-[#0f6cbd] underline">
                  Editar
                </Link>
              </td>
            </tr>
          ))}
          {professores.length === 0 && (
            <tr>
              <td colSpan={5} className="py-4 text-center opacity-70">
                Nenhum professor cadastrado.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </>
  );
}

export default function PaginaProfessores() {
  return (
    <main className="flex flex-1 flex-col gap-4 p-4">
      <Suspense fallback={<p className="text-sm">Carregando…</p>}>
        <Conteudo />
      </Suspense>
    </main>
  );
}
