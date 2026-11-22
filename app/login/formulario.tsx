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
      <label className="flex flex-col gap-1 text-sm">
        E-mail
        <input
          name="email"
          type="email"
          autoComplete="username"
          required
          defaultValue={estado.email}
          className="rounded border px-3 py-2"
        />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        Senha
        <input
          name="senha"
          type="password"
          autoComplete="current-password"
          required
          className="rounded border px-3 py-2"
        />
      </label>
      {estado.erro && (
        <p role="alert" className="text-sm text-red-700">
          {estado.erro}
        </p>
      )}
      <button
        type="submit"
        disabled={enviando}
        className="rounded bg-[#0f6cbd] px-3 py-2 font-medium text-white disabled:opacity-60"
      >
        {enviando ? "Entrando…" : "Entrar"}
      </button>
    </form>
  );
}
