import { Suspense } from "react";
import { connection } from "next/server";
import { prisma } from "@/lib/prisma";
import Calendario from "@/app/ui/calendario";

async function CalendarioComDados() {
  // Lê o banco a cada requisição (não congela a lista de professores no build).
  await connection();
  const professores = await prisma.professor.findMany({
    where: { ativo: true },
    select: { id: true, nome: true, cor: true },
    orderBy: { nome: "asc" },
  });
  return <Calendario professores={professores} />;
}

export default function Home() {
  return (
    <main className="flex flex-1 flex-col gap-4 p-4">
      <h1 className="text-xl font-semibold">Calendário de alocação dos professores</h1>
      <Suspense fallback={<p className="text-sm">Carregando calendário…</p>}>
        <CalendarioComDados />
      </Suspense>
    </main>
  );
}
