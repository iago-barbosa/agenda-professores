import type { ReactNode } from "react";
import type { UsuarioAtual } from "@/lib/auth";
import MenuLateral from "@/app/ui/menu-lateral";
import { sair } from "@/app/login/actions";

/** Estrutura padrão das telas logadas: menu lateral + cabeçalho da página + conteúdo. */
export default function Pagina({
  usuario,
  titulo,
  descricao,
  acoes,
  children,
}: {
  usuario: UsuarioAtual;
  titulo: string;
  descricao?: ReactNode;
  acoes?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-1 flex-col lg:flex-row">
      <MenuLateral nome={usuario.nome} papel={usuario.papel} />
      <main className="min-w-0 flex-1 px-4 py-6 sm:px-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-6">
          <header className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-gray-900">
                {titulo}
              </h1>
              {descricao && (
                <p className="mt-1 max-w-3xl text-sm text-gray-500">
                  {descricao}
                </p>
              )}
            </div>
            <div className="flex items-center gap-2">
              {acoes}
              {/* No celular o menu lateral vira barra no topo; o Sair fica aqui */}
              <form action={sair} className="lg:hidden">
                <button type="submit" className="botao botao-secundario">
                  Sair
                </button>
              </form>
            </div>
          </header>
          {children}
        </div>
      </main>
    </div>
  );
}

/** Tela de carregamento enquanto a sessão e os dados chegam. */
export function Carregando() {
  return (
    <div className="flex flex-1 items-center justify-center p-10 text-sm text-gray-500">
      Carregando…
    </div>
  );
}
