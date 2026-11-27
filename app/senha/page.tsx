import { Suspense } from "react";
import { exigirUsuario } from "@/lib/auth";
import { TAMANHO_MINIMO_SENHA } from "@/lib/senha";
import Pagina, { Carregando } from "@/app/ui/pagina";
import FormularioAcao from "@/app/ui/formulario-acao";
import { alterarSenha } from "./actions";

async function Conteudo() {
  const usuario = await exigirUsuario();
  return (
    <Pagina usuario={usuario} titulo="Alterar senha" descricao="Troque a senha que você usa para entrar no sistema.">
      <section className="cartao max-w-md">
        <FormularioAcao acao={alterarSenha} textoBotao="Alterar senha" limparAoSalvar>
          <label className="rotulo">
            Senha atual
            <input name="senhaAtual" type="password" required autoComplete="current-password" className="campo" />
          </label>
          <label className="rotulo">
            Nova senha <span className="ajuda">(mínimo de {TAMANHO_MINIMO_SENHA} caracteres)</span>
            <input
              name="novaSenha"
              type="password"
              required
              minLength={TAMANHO_MINIMO_SENHA}
              autoComplete="new-password"
              className="campo"
            />
          </label>
          <label className="rotulo">
            Confirmar nova senha
            <input
              name="confirmarSenha"
              type="password"
              required
              minLength={TAMANHO_MINIMO_SENHA}
              autoComplete="new-password"
              className="campo"
            />
          </label>
        </FormularioAcao>
      </section>
    </Pagina>
  );
}

export default function PaginaSenha() {
  return (
    <Suspense fallback={<Carregando />}>
      <Conteudo />
    </Suspense>
  );
}
