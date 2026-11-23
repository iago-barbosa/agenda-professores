import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { exigirAdmin } from "@/lib/auth";
import Cabecalho from "@/app/ui/cabecalho";
import FormularioAcao from "@/app/ui/formulario-acao";
import BotaoExcluir from "@/app/ui/botao-excluir";
import CamposProfessor from "../campos";
import { editarProfessor, excluirProfessor } from "../actions";

async function Conteudo({ params }: { params: Promise<{ id: string }> }) {
  const usuario = await exigirAdmin();
  const id = Number((await params).id);
  const professor = Number.isInteger(id)
    ? await prisma.professor.findUnique({ where: { id } })
    : null;
  if (!professor) notFound();

  return (
    <>
      <Cabecalho usuario={usuario} />
      <Link href="/professores" className="text-sm text-[#0f6cbd] underline">
        ← Voltar para professores
      </Link>
      <h1 className="text-xl font-semibold">Editar professor</h1>
      <section className="rounded border p-4">
        <FormularioAcao acao={editarProfessor.bind(null, professor.id)} textoBotao="Salvar">
          <CamposProfessor professor={professor} />
        </FormularioAcao>
      </section>
      <BotaoExcluir
        acao={excluirProfessor.bind(null, professor.id)}
        confirmacao={`Excluir o professor ${professor.nome}?`}
        texto="Excluir professor"
      />
    </>
  );
}

export default function PaginaProfessor({ params }: PageProps<"/professores/[id]">) {
  return (
    <main className="flex flex-1 flex-col gap-4 p-4">
      <Suspense fallback={<p className="text-sm">Carregando…</p>}>
        <Conteudo params={params} />
      </Suspense>
    </main>
  );
}
