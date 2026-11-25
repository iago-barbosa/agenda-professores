import { Suspense } from "react";
import { exigirUsuario } from "@/lib/auth";
import { carregarCatalogo } from "@/lib/catalogo";
import Calendario from "@/app/ui/calendario";
import Pagina, { Carregando } from "@/app/ui/pagina";

// Lê a sessão (cookie) e o banco a cada requisição, por isso fica dentro do Suspense.
async function Conteudo() {
  const usuario = await exigirUsuario();
  const catalogo = await carregarCatalogo();
  const podeEditar = usuario.papel === "ADMIN";
  return (
    <Pagina
      usuario={usuario}
      titulo="Calendário"
      descricao={
        podeEditar
          ? "Arraste em um horário vazio para criar uma aula. Clique em uma aula para editar ou excluir."
          : "Clique em uma aula para ver os detalhes."
      }
    >
      <Calendario catalogo={catalogo} podeEditar={podeEditar} meuProfessorId={usuario.professorId} />
    </Pagina>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<Carregando />}>
      <Conteudo />
    </Suspense>
  );
}
