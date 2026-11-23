import { Suspense } from "react";
import { exigirAdmin } from "@/lib/auth";
import { carregarCatalogo } from "@/lib/catalogo";
import Pagina, { Carregando } from "@/app/ui/pagina";
import FormularioLote from "./formulario";

async function Conteudo() {
  const usuario = await exigirAdmin();
  const catalogo = await carregarCatalogo();
  return (
    <Pagina
      usuario={usuario}
      titulo="Alocação em lote"
      descricao="Cria uma aula em cada data entre o início e o fim da UC que cair nos dias da semana escolhidos. Curso, UC e turma podem ser digitados: o que ainda não existir é cadastrado ao salvar."
    >
      <div className="cartao max-w-3xl">
        <FormularioLote catalogo={catalogo} />
      </div>
    </Pagina>
  );
}

export default function PaginaLote() {
  return (
    <Suspense fallback={<Carregando />}>
      <Conteudo />
    </Suspense>
  );
}
