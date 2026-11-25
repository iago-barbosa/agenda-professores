import { Suspense } from "react";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { exigirAdmin } from "@/lib/auth";
import Pagina, { Carregando } from "@/app/ui/pagina";
import FormularioAcao from "@/app/ui/formulario-acao";
import CamposProfessor from "./campos";
import { criarProfessor } from "./actions";

async function Conteudo() {
  const usuario = await exigirAdmin();
  const professores = await prisma.professor.findMany({
    orderBy: { nome: "asc" },
    include: { _count: { select: { alocacoes: true } }, usuario: { select: { ativo: true } } },
  });
  return (
    <Pagina usuario={usuario} titulo="Professores" descricao="Cadastre os professores, escolha a cor de cada um no calendário e libere o acesso com e-mail e senha.">
      <section className="cartao">
        <h2 className="cartao-titulo">Novo professor</h2>
        <FormularioAcao acao={criarProfessor} textoBotao="Cadastrar professor" limparAoSalvar>
          <CamposProfessor />
        </FormularioAcao>
      </section>

      <section className="cartao overflow-x-auto p-0">
        <table className="tabela">
          <thead>
            <tr>
              <th>Nome</th>
              <th>E-mail</th>
              <th>Acesso</th>
              <th>Aulas</th>
              <th>Situação</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {professores.map((p) => (
              <tr key={p.id}>
                <td className="font-medium">
                  <span className="mr-2.5 inline-block h-3 w-3 rounded-full align-middle" style={{ background: p.cor }} />
                  {p.nome}
                </td>
                <td className="text-gray-600">{p.email ?? "—"}</td>
                <td>
                  <span
                    className={`selo ${
                      p.usuario?.ativo ? "bg-blue-50 text-blue-700" : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {p.usuario ? (p.usuario.ativo ? "Pode entrar" : "Bloqueado") : "Sem acesso"}
                  </span>
                </td>
                <td>{p._count.alocacoes}</td>
                <td>
                  <span className={`selo ${p.ativo ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-600"}`}>
                    {p.ativo ? "Ativo" : "Inativo"}
                  </span>
                </td>
                <td className="text-right">
                  <Link href={`/professores/${p.id}`} className="link">
                    Editar
                  </Link>
                </td>
              </tr>
            ))}
            {professores.length === 0 && (
              <tr>
                <td colSpan={6} className="py-8 text-center text-gray-500">
                  Nenhum professor cadastrado.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </section>
    </Pagina>
  );
}

export default function PaginaProfessores() {
  return (
    <Suspense fallback={<Carregando />}>
      <Conteudo />
    </Suspense>
  );
}
