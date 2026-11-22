"use client";

import { useEffect, useRef, useState } from "react";
import type { Catalogo } from "@/lib/catalogo";
import { salvarAlocacao, excluirAlocacao } from "@/app/alocacoes/actions";
import FormularioAcao from "@/app/ui/formulario-acao";
import CamposVinculo from "@/app/ui/campos-vinculo";
import { campo, rotulo } from "@/app/ui/estilos";

export type DadosAlocacao = {
  id?: number;
  professorId?: number;
  professor?: string;
  cursoId?: number;
  curso?: string;
  ucId?: number;
  uc?: string;
  turmaId?: number;
  turma?: string;
  serieId?: number | null;
  data: string; // AAAA-MM-DD
  horaInicio: string; // HH:MM
  horaFim: string; // HH:MM
};

type Props = {
  dados: DadosAlocacao;
  catalogo: Catalogo;
  podeEditar: boolean;
  aoFechar: () => void;
  aoAlterar: () => void;
};

export default function DialogoAlocacao({ dados, catalogo, podeEditar, aoFechar, aoAlterar }: Props) {
  const dialogo = useRef<HTMLDialogElement>(null);
  const [mensagem, setMensagem] = useState<string>();
  const [excluindo, setExcluindo] = useState(false);

  useEffect(() => {
    dialogo.current?.showModal();
  }, []);

  const [ano, mes, dia] = dados.data.split("-");
  const dataBr = `${dia}/${mes}/${ano}`;

  async function excluir(escopo: "uma" | "serie") {
    const texto =
      escopo === "serie"
        ? "Excluir TODAS as aulas desta série (lote)?"
        : "Excluir esta aula?";
    if (!dados.id || !confirm(texto)) return;
    setExcluindo(true);
    const r = await excluirAlocacao(dados.id, escopo);
    setExcluindo(false);
    if (r.erro) setMensagem(r.erro);
    else {
      aoAlterar();
      aoFechar();
    }
  }

  return (
    <dialog
      ref={dialogo}
      onClose={aoFechar}
      className="m-auto w-full max-w-xl rounded-lg p-0 shadow-xl backdrop:bg-black/40"
    >
      <div className="flex flex-col gap-4 p-5">
        <div className="flex items-start justify-between">
          <h2 className="text-lg font-semibold">
            {!podeEditar ? "Detalhes da aula" : dados.id ? "Editar aula" : "Nova aula"}
          </h2>
          <button type="button" onClick={() => dialogo.current?.close()} aria-label="Fechar" className="px-2 text-lg">
            ×
          </button>
        </div>

        {!podeEditar ? (
          <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-sm">
            <dt className="opacity-70">Data</dt>
            <dd>{dataBr}</dd>
            <dt className="opacity-70">Horário</dt>
            <dd>
              {dados.horaInicio} – {dados.horaFim}
            </dd>
            <dt className="opacity-70">Professor</dt>
            <dd>{dados.professor}</dd>
            <dt className="opacity-70">Curso</dt>
            <dd>{dados.curso}</dd>
            <dt className="opacity-70">UC</dt>
            <dd>{dados.uc}</dd>
            <dt className="opacity-70">Turma</dt>
            <dd>{dados.turma}</dd>
          </dl>
        ) : (
          <>
            {dados.serieId && (
              <p className="rounded bg-blue-50 p-2 text-sm text-blue-900">
                Esta aula faz parte de uma alocação em lote. Salvar aqui altera só esta data.
              </p>
            )}
            <FormularioAcao
              acao={salvarAlocacao}
              textoBotao="Salvar"
              aoSalvar={() => {
                aoAlterar();
                dialogo.current?.close();
              }}
            >
              {dados.id && <input type="hidden" name="id" value={dados.id} />}
              <CamposVinculo catalogo={catalogo} inicial={dados} />
              <div className="grid gap-3 sm:grid-cols-3">
                <label className={rotulo}>
                  Data
                  <input name="data" type="date" required defaultValue={dados.data} className={campo} />
                </label>
                <label className={rotulo}>
                  Início
                  <input name="horaInicio" type="time" required step={300} defaultValue={dados.horaInicio} className={campo} />
                </label>
                <label className={rotulo}>
                  Fim
                  <input name="horaFim" type="time" required step={300} defaultValue={dados.horaFim} className={campo} />
                </label>
              </div>
            </FormularioAcao>

            {dados.id && (
              <div className="flex flex-wrap items-center gap-4 border-t pt-3 text-sm">
                <button type="button" disabled={excluindo} onClick={() => excluir("uma")} className="text-red-700 underline">
                  Excluir esta aula
                </button>
                {dados.serieId && (
                  <button type="button" disabled={excluindo} onClick={() => excluir("serie")} className="text-red-700 underline">
                    Excluir toda a série
                  </button>
                )}
                {mensagem && <span className="text-red-700">{mensagem}</span>}
              </div>
            )}
          </>
        )}
      </div>
    </dialog>
  );
}
