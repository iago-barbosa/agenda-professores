import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import { exigirUsuario } from "@/lib/auth";
import Calendario from "@/app/ui/calendario";
import UsuarioLogado from "@/app/ui/usuario-logado";

// Lê a sessão (cookie) e o banco a cada requisição, por isso fica dentro do Suspense.
async function ConteudoLogado() {
  const usuario = await exigirUsuario();
  const professores = await prisma.professor.findMany({
    where: { ativo: true },
    select: { id: true, nome: true, cor: true },
    orderBy: { nome: "asc" },
  });
  return (
    <>
      <div className="flex justify-end">
        <UsuarioLogado usuario={usuario} />
      </div>
      <Calendario professores={professores} />
    </>
  );
}

export default function Home() {
  return (
    <main className="flex flex-1 flex-col gap-4 p-4">
      <h1 className="text-xl font-semibold">Calendário de alocação dos professores</h1>
      <Suspense fallback={<p className="text-sm">Carregando calendário…</p>}>
        <ConteudoLogado />
      </Suspense>
    </main>
  );
}
