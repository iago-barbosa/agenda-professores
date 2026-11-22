import { Suspense } from "react";
import { exigirUsuario } from "@/lib/auth";
import { carregarCatalogo } from "@/lib/catalogo";
import Calendario from "@/app/ui/calendario";
import Cabecalho from "@/app/ui/cabecalho";

// Lê a sessão (cookie) e o banco a cada requisição, por isso fica dentro do Suspense.
async function ConteudoLogado() {
  const usuario = await exigirUsuario();
  const catalogo = await carregarCatalogo();
  const podeEditar = usuario.papel === "ADMIN";
  return (
    <>
      <Cabecalho usuario={usuario} />
      <h1 className="text-xl font-semibold">Calendário de alocação dos professores</h1>
      <p className="text-sm opacity-80">
        {podeEditar
          ? "Clique e arraste em um horário vazio para criar uma aula. Clique em uma aula para editar ou excluir."
          : "Clique em uma aula para ver os detalhes."}
      </p>
      <Calendario catalogo={catalogo} podeEditar={podeEditar} />
    </>
  );
}

export default function Home() {
  return (
    <main className="flex flex-1 flex-col gap-4 p-4">
      <Suspense fallback={<p className="text-sm">Carregando calendário…</p>}>
        <ConteudoLogado />
      </Suspense>
    </main>
  );
}
