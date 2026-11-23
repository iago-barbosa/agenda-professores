import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { exigirAdmin } from "@/lib/auth";
import Pagina, { Carregando } from "@/app/ui/pagina";
import FormularioAcao from "@/app/ui/formulario-acao";
import BotaoExcluir from "@/app/ui/botao-excluir";
import CamposProfessor from "../campos";
import { editarProfessor, excluirProfessor } from "../actions";

async function Conteudo({ params }: { params: Promise<{ id: string }> }) {
  const usuario = await exigirAdmin();
  const id = Number((await params).id);
  const professor = Number.isInteger(id) ? await prisma.professor.findUnique({ where: { id } }) : null;
  if (!professor) notFound();

  return (
    <Pagina
      usuario={usuario}
      titulo={professor.nome}
      acoes={
        <Link href="/professores" className="botao botao-secundario">
          Voltar
        </Link>
      }
    >
      <section className="cartao max-w-3xl">
        <h2 className="cartao-titulo">Dados do professor</h2>
        <FormularioAcao acao={editarProfessor.bind(null, professor.id)} textoBotao="Salvar alterações">
          <CamposProfessor professor={professor} />
        </FormularioAcao>
      </section>
      <section className="cartao max-w-3xl">
        <h2 className="cartao-titulo">Excluir</h2>
        <p className="mb-3 text-sm text-gray-500">Só é possível excluir um professor sem aulas. Para escondê-lo, desmarque “Ativo”.</p>
        <BotaoExcluir
          acao={excluirProfessor.bind(null, professor.id)}
          confirmacao={`Excluir o professor ${professor.nome}?`}
          texto="Excluir professor"
        />
      </section>
    </Pagina>
  );
}

export default function PaginaProfessor({ params }: PageProps<"/professores/[id]">) {
  return (
    <Suspense fallback={<Carregando />}>
      <Conteudo params={params} />
    </Suspense>
  );
}
