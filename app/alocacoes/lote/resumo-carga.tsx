"use client";

import { useEffect, useRef, useState } from "react";
import type { Catalogo } from "@/lib/catalogo";
import { chaveUcTurma, formatarHoras } from "@/lib/carga";
import { gerarOcorrencias, validarSerie, type DadosSerie } from "@/lib/recorrencia";

const limpar = (s: string) => s.trim().replace(/\s+/g, " ");
const igual = (a: string, b: string) =>
  limpar(a).localeCompare(limpar(b), "pt-BR", { sensitivity: "base" }) === 0;

/** Minutos entre duas horas "HH:MM". */
function minutos(inicio: string, fim: string) {
  const [h1, m1] = inicio.split(":").map(Number);
  const [h2, m2] = fim.split(":").map(Number);
  return h2 * 60 + m2 - (h1 * 60 + m1);
}

/** Lê o formulário do lote e devolve tudo que o resumo precisa. */
function lerFormulario(form: HTMLFormElement, catalogo: Catalogo) {
  const dados = new FormData(form);
  const valor = (campo: string) => String(dados.get(campo) ?? "");

  const curso = catalogo.cursos.find((c) => igual(c.nome, valor("curso")));
  const uc = curso?.ucs.find((u) => igual(u.nome, valor("uc")));
  const turma = curso?.turmas.find((t) => igual(t.codigo, valor("turma")));
  const cargaNova = Number(valor("cargaHoraria")) || null;
  const carga = uc ? uc.cargaHoraria : valor("uc") ? cargaNova : null;
  const alocadas = uc && turma ? (catalogo.horasAlocadas[chaveUcTurma(uc.id, turma.id)] ?? 0) : 0;

  const serie: DadosSerie = {
    dataInicio: valor("dataInicio"),
    dataFim: valor("dataFim"),
    diasSemana: dados.getAll("dias").map(Number),
    horaInicio: valor("horaInicio"),
    horaFim: valor("horaFim"),
  };
  return { carga, alocadas, serie };
}

/**
 * Mostra quantas horas o lote vai criar e quanto falta da carga horária da UC,
 * e calcula a data de fim que fecha a carga.
 */
export default function ResumoCarga({ catalogo }: { catalogo: Catalogo }) {
  const ancora = useRef<HTMLDivElement>(null);
  const [info, setInfo] = useState<ReturnType<typeof lerFormulario> | null>(null);
  const [aviso, setAviso] = useState("");

  // Recalcula a cada mudança em qualquer campo do formulário.
  useEffect(() => {
    const form = ancora.current?.closest("form");
    if (!form) return;
    // No "reset" os campos só voltam ao padrão depois do evento: lê no próximo ciclo.
    const atualizar = () =>
      setTimeout(() => {
        setInfo(lerFormulario(form, catalogo));
        setAviso("");
      });
    form.addEventListener("input", atualizar);
    form.addEventListener("change", atualizar);
    form.addEventListener("reset", atualizar);
    return () => {
      form.removeEventListener("input", atualizar);
      form.removeEventListener("change", atualizar);
      form.removeEventListener("reset", atualizar);
    };
  }, [catalogo]);

  const { serie, carga, alocadas } = info ?? {
    serie: null,
    carga: null,
    alocadas: 0,
  };
  const duracaoAula =
    serie && /^\d\d:\d\d$/.test(serie.horaInicio) && /^\d\d:\d\d$/.test(serie.horaFim)
      ? minutos(serie.horaInicio, serie.horaFim) / 60
      : 0;
  const falta = carga ? Math.max(carga - alocadas, 0) : 0;
  const podeCalcular =
    !!serie && !!carga && falta > 0 && duracaoAula > 0 && serie.diasSemana.length > 0 && !!serie.dataInicio;

  let aulas: number | null = null;
  if (serie && validarSerie(serie).length === 0) aulas = gerarOcorrencias(serie).length;
  const horasLote = aulas !== null ? aulas * duracaoAula : null;

  function calcularFim() {
    const form = ancora.current?.closest("form");
    if (!form || !serie || !podeCalcular) return;
    const dias = new Set(serie.diasSemana);
    const atual = new Date(`${serie.dataInicio}T12:00:00Z`);
    let somadas = 0;
    let quantas = 0;
    // Procura até 3 anos à frente, para não ficar em laço sem fim.
    for (let i = 0; i < 366 * 3; i++) {
      if (dias.has(atual.getUTCDay())) {
        somadas += duracaoAula;
        quantas++;
        if (somadas >= falta - 1 / 60) break;
      }
      atual.setUTCDate(atual.getUTCDate() + 1);
    }
    const campo = form.elements.namedItem("dataFim") as HTMLInputElement | null;
    if (!campo) return;
    campo.value = atual.toISOString().slice(0, 10);
    campo.dispatchEvent(new Event("input", { bubbles: true }));
    const sobra = quantas * duracaoAula - falta;
    const mensagem =
      `Fim calculado: ${quantas} aula(s) de ${formatarHoras(duracaoAula)} para completar ${formatarHoras(falta)}` +
      (sobra > 1 / 60
        ? `. A última passa ${formatarHoras(sobra)} da carga: depois de criar, encurte essa aula no calendário. `
        : ". ") +
      "Feriados e recessos não são descontados: ajuste a data se precisar.";
    // Depois da releitura disparada pelo evento acima.
    setTimeout(() => setAviso(mensagem), 0);
  }

  const total = horasLote !== null ? alocadas + horasLote : null;
  const passou = carga && total !== null && total > carga + 1 / 60;

  return (
    <div ref={ancora} className="flex flex-col gap-2 rounded-lg bg-gray-50 p-3 text-sm text-gray-700">
      {carga ? (
        <p>
          Carga horária da UC: <strong>{formatarHoras(carga)}</strong> · já alocadas para esta turma:{" "}
          <strong>{formatarHoras(alocadas)}</strong> · faltam <strong>{formatarHoras(falta)}</strong>
        </p>
      ) : (
        <p className="text-gray-500">
          Informe uma UC com carga horária para o sistema calcular o fim e controlar as horas.
        </p>
      )}
      {aulas !== null && horasLote !== null && (
        <p className={passou ? "font-medium text-red-700" : undefined}>
          Este lote cria <strong>{aulas}</strong> aula(s), <strong>{formatarHoras(horasLote)}</strong>
          {carga && total !== null && (
            <>
              {" "}
              · a turma ficará com <strong>{formatarHoras(total)}</strong> de {formatarHoras(carga)}
              {passou
                ? ` (${formatarHoras(total - carga)} além da carga)`
                : total < carga - 1 / 60
                  ? ` (ainda faltarão ${formatarHoras(carga - total)})`
                  : " (carga completa)"}
            </>
          )}
        </p>
      )}
      {carga ? (
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={calcularFim}
            disabled={!podeCalcular}
            className="botao botao-secundario"
          >
            Calcular fim pela carga horária
          </button>
          {!podeCalcular && falta > 0 && (
            <span className="ajuda">Preencha início, dias da semana e horários.</span>
          )}
          {falta === 0 && <span className="ajuda">Esta turma já cumpriu a carga desta UC.</span>}
        </div>
      ) : null}
      {aviso && <p className="text-gray-600">{aviso}</p>}
    </div>
  );
}
