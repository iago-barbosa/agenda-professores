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

export default function DialogoAlocacao({
  dados,
  catalogo,
  podeEditar,
  aoFechar,
  aoAlterar,
}: Props) {
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
      className="m-auto w-full max-w-2xl rounded-xl border border-gray-200 bg-white p-0 text-gray-900 shadow-2xl backdrop:bg-gray-900/40"
    >
      <div className="flex flex-col gap-5 p-6">
        <div className="flex items-start justify-between border-b border-gray-100 pb-4">
          <h2 className="text-lg font-semibold">
            {!podeEditar
              ? "Detalhes da aula"
              : dados.id
                ? "Editar aula"
                : "Nova aula"}
          </h2>
          <button
            type="button"
            onClick={() => dialogo.current?.close()}
            aria-label="Fechar"
            className="-mr-2 rounded-md px-2 text-2xl leading-none text-gray-400 hover:bg-gray-100 hover:text-gray-700"
          >
            ×
          </button>
        </div>

        {!podeEditar ? (
          <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 text-sm">
            <dt className="font-medium text-gray-500">Data</dt>
            <dd>{dataBr}</dd>
            <dt className="font-medium text-gray-500">Horário</dt>
            <dd>
              {dados.horaInicio} – {dados.horaFim}
            </dd>
            <dt className="font-medium text-gray-500">Professor</dt>
            <dd>{dados.professor}</dd>
            <dt className="font-medium text-gray-500">Curso</dt>
            <dd>{dados.curso}</dd>
            <dt className="font-medium text-gray-500">UC</dt>
            <dd>{dados.uc}</dd>
            <dt className="font-medium text-gray-500">Turma</dt>
            <dd>{dados.turma || "—"}</dd>
          </dl>
        ) : (
          <>
            {dados.serieId && (
              <p className="alerta-info">
                Esta aula faz parte de uma alocação em lote. Salvar aqui altera
                só esta data.
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
                  <input
                    name="data"
                    type="date"
                    required
                    defaultValue={dados.data}
                    className={campo}
                  />
                </label>
                <label className={rotulo}>
                  Início
                  <input
                    name="horaInicio"
                    type="time"
                    required
                    step={300}
                    defaultValue={dados.horaInicio}
                    className={campo}
                  />
                </label>
                <label className={rotulo}>
                  Fim
                  <input
                    name="horaFim"
                    type="time"
                    required
                    step={300}
                    defaultValue={dados.horaFim}
                    className={campo}
                  />
                </label>
              </div>
            </FormularioAcao>

            {dados.id && (
              <div className="flex flex-wrap items-center gap-3 border-t border-gray-100 pt-4 text-sm">
                <button
                  type="button"
                  disabled={excluindo}
                  onClick={() => excluir("uma")}
                  className="botao botao-perigo"
                >
                  Excluir esta aula
                </button>
                {dados.serieId && (
                  <button
                    type="button"
                    disabled={excluindo}
                    onClick={() => excluir("serie")}
                    className="botao botao-perigo"
                  >
                    Excluir toda a série
                  </button>
                )}
                {mensagem && <span className="alerta-erro">{mensagem}</span>}
              </div>
            )}
          </>
        )}
      </div>
    </dialog>
  );
}
