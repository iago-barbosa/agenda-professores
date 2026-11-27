"use client";

import {
  Fragment,
  startTransition,
  useActionState,
  useEffect,
  useRef,
  type ReactNode,
} from "react";
import type { EstadoAcao } from "@/lib/formulario";

type Props = {
  acao: (estado: EstadoAcao, formData: FormData) => Promise<EstadoAcao>;
  children: ReactNode;
  textoBotao: string;
  /** Limpa os campos depois de salvar (útil em formulários de "novo"). */
  limparAoSalvar?: boolean;
  className?: string;
  aoSalvar?: () => void;
};

export default function FormularioAcao({
  acao,
  children,
  textoBotao,
  limparAoSalvar = false,
  className = "flex flex-col gap-4",
  aoSalvar,
}: Props) {
  // `chave` muda a cada salvamento com sucesso quando limparAoSalvar está ligado:
  // os campos são recriados do zero (inclusive os que guardam estado no React,
  // como curso/UC/turma digitáveis). Em erro ou conflito, a chave não muda e nada se perde.
  const [estado, executar, enviando] = useActionState(
    async (anterior: EstadoAcao & { chave?: number }, dados: FormData) => {
      const r = await acao(anterior, dados);
      const salvou = r.versao !== undefined && !r.erro && !r.conflitos?.length;
      return {
        ...r,
        chave: salvou && limparAoSalvar ? r.versao : anterior.chave,
      };
    },
    {} as EstadoAcao & { chave?: number },
  );
  const form = useRef<HTMLFormElement>(null);
  const ultimaVersao = useRef<number | undefined>(undefined);

  useEffect(() => {
    if (estado.versao && estado.versao !== ultimaVersao.current) {
      ultimaVersao.current = estado.versao;
      if (limparAoSalvar) form.current?.reset();
      aoSalvar?.();
    }
  }, [estado.versao, limparAoSalvar, aoSalvar]);

  return (
    <form
      ref={form}
      className={className}
      // Envia sem usar `action={...}`: com `action`, o React limpa o formulário depois
      // de cada envio, e o usuário perderia o que digitou quando aparece um erro ou conflito.
      onSubmit={(e) => {
        e.preventDefault();
        const dados = new FormData(e.currentTarget);
        startTransition(() => executar(dados));
      }}
    >
      <Fragment key={estado.chave ?? 0}>{children}</Fragment>
      {estado.conflitos && estado.conflitos.length > 0 && (
        <div role="alert" className="alerta-aviso">
          <p className="mb-1 font-semibold">
            {estado.conflitos.length} aviso(s) antes de salvar:
          </p>
          <ul className="mb-2 max-h-40 list-disc overflow-y-auto pl-5">
            {estado.conflitos.map((c, i) => (
              <li key={i}>
                {c.data}: {c.motivo}
              </li>
            ))}
          </ul>
          <label className="flex items-center gap-2 font-medium">
            <input
              type="checkbox"
              name="confirmarConflitos"
              className="h-4 w-4"
            />
            Salvar mesmo assim
          </label>
        </div>
      )}
      {estado.erro && (
        <p role="alert" className="alerta-erro">
          {estado.erro}
        </p>
      )}
      {estado.ok && !estado.erro && (
        <p className="alerta-sucesso">{estado.ok}</p>
      )}
      <div>
        <button
          type="submit"
          disabled={enviando}
          className="botao botao-primario"
        >
          {enviando ? "Salvando…" : textoBotao}
        </button>
      </div>
    </form>
  );
}
