"use client";

import { useActionState, useLayoutEffect, useRef } from "react";
import { entrar, type EstadoLogin } from "./actions";

export default function FormularioLogin() {
  const [estado, acao, enviando] = useActionState<EstadoLogin, FormData>(entrar, {});
  const formulario = useRef<HTMLFormElement>(null);

  // O Next mantém a página de login escondida depois de entrar. Ao escondê-la,
  // limpa o formulário para a senha digitada não ficar guardada.
  useLayoutEffect(() => {
    const form = formulario.current;
    return () => form?.reset();
  }, []);

  return (
    <form ref={formulario} action={acao} className="flex flex-col gap-4">
      <label className="rotulo">
        E-mail
        <input
          name="email"
          type="email"
          autoComplete="username"
          required
          defaultValue={estado.email}
          className="campo"
        />
      </label>
      <label className="rotulo">
        Senha
        <input
          name="senha"
          type="password"
          autoComplete="current-password"
          required
          className="campo"
        />
      </label>
      {estado.erro && (
        <p role="alert" className="alerta-erro">
          {estado.erro}
        </p>
      )}
      <button
        type="submit"
        disabled={enviando}
        className="botao botao-primario w-full"
      >
        {enviando ? "Entrando…" : "Entrar"}
      </button>
    </form>
  );
}
