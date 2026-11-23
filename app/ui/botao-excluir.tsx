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
  const [estado, executar, enviando] = useActionState(
    () => acao(),
    {} as EstadoAcao,
  );
  return (
    <form
      action={executar}
      onSubmit={(e) => {
        if (!confirm(confirmacao)) e.preventDefault();
      }}
      className="inline-flex items-center gap-2"
    >
      <button type="submit" disabled={enviando} className="botao botao-perigo">
        {texto}
      </button>
      {estado.erro && <span className="alerta-erro">{estado.erro}</span>}
    </form>
  );
}
