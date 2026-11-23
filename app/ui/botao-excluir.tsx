"use client";

import { useActionState } from "react";
import type { EstadoAcao } from "@/lib/formulario";

/** Botão de excluir com confirmação. Mostra o erro ao lado, se houver. */
export default function BotaoExcluir({
  acao,
  confirmacao,
  texto = "Excluir",
}: {
  acao: () => Promise<EstadoAcao>;
  confirmacao: string;
  texto?: string;
}) {
  const [estado, executar, enviando] = useActionState(() => acao(), {} as EstadoAcao);
  return (
    <form
      action={executar}
      onSubmit={(e) => {
        if (!confirm(confirmacao)) e.preventDefault();
      }}
      className="inline-flex items-center gap-2"
    >
      <button
        type="submit"
        disabled={enviando}
        className="text-sm text-red-700 underline disabled:opacity-60"
      >
        {texto}
      </button>
      {estado.erro && <span className="text-sm text-red-700">{estado.erro}</span>}
    </form>
  );
}
