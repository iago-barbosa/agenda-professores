import { Suspense } from "react";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { exigirAdmin } from "@/lib/auth";
import Pagina, { Carregando } from "@/app/ui/pagina";
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
    <Pagina
      usuario={usuario}
      titulo="Cursos, UCs e turmas"
      descricao="Cursos e UCs também podem ser criados direto na alocação em lote, digitando o nome."
    >
      <section className="cartao">
        <h2 className="cartao-titulo">Novo curso</h2>
        <FormularioAcao
          acao={criarCurso}
          textoBotao="Cadastrar e adicionar UCs"
        >
          <CamposCurso />
        </FormularioAcao>
      </section>

      <section className="cartao overflow-x-auto p-0">
        <table className="tabela">
          <thead>
            <tr>
              <th>Curso</th>
              <th>Modalidade</th>
              <th>UCs</th>
              <th>Turmas</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {cursos.map((c) => (
              <tr key={c.id}>
                <td className="font-medium">{c.nome}</td>
                <td>{NOME_MODALIDADE[c.modalidade]}</td>
                <td>{c._count.ucs}</td>
                <td>{c._count.turmas}</td>
                <td className="text-right">
                  <Link href={`/cursos/${c.id}`} className="link">
                    Abrir
                  </Link>
                </td>
              </tr>
            ))}
            {cursos.length === 0 && (
              <tr>
                <td colSpan={5} className="py-8 text-center text-gray-500">
                  Nenhum curso cadastrado.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </section>
    </Pagina>
  );
}

export default function PaginaCursos() {
  return (
    <Suspense fallback={<Carregando />}>
      <Conteudo />
    </Suspense>
  );
}
