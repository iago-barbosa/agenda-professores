import { Suspense } from "react";
import { exigirAdmin } from "@/lib/auth";
import { carregarCatalogo } from "@/lib/catalogo";
import Cabecalho from "@/app/ui/cabecalho";
import FormularioLote from "./formulario";

async function Conteudo() {
  const usuario = await exigirAdmin();
  const catalogo = await carregarCatalogo();
  return (
    <>
      <Cabecalho usuario={usuario} />
      <h1 className="text-xl font-semibold">Alocação em lote por UC</h1>
      <p className="max-w-2xl text-sm opacity-80">
        Cria uma aula em cada data entre o início e o fim da UC que cair nos dias da semana escolhidos.
        Se houver conflito de horário com o mesmo professor ou a mesma turma, o sistema avisa antes de salvar.
      </p>
      <FormularioLote catalogo={catalogo} />
    </>
  );
}

export default function PaginaLote() {
  return (
    <main className="flex flex-1 flex-col gap-4 p-4">
      <Suspense fallback={<p className="text-sm">Carregando…</p>}>
        <Conteudo />
      </Suspense>
    </main>
  );
}
