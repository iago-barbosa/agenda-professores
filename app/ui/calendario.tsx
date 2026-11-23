"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import FullCalendar, { type CalendarRef } from "@fullcalendar/react";
import timeGridPlugin from "@fullcalendar/react/timegrid";
import interactionPlugin from "@fullcalendar/react/interaction";
import formaTheme from "@fullcalendar/react/themes/forma";
import ptBr from "@fullcalendar/react/locales/pt-br";
import "@fullcalendar/react/skeleton.css";
import "@fullcalendar/react/themes/forma/theme.css";
import "@fullcalendar/react/themes/forma/palettes/blue.css";
import type { Catalogo } from "@/lib/catalogo";
import DialogoAlocacao, { type DadosAlocacao } from "@/app/ui/dialogo-alocacao";

function formatarData(data: string) {
  const [ano, mes, dia] = data.split("-");
  return `${dia}/${mes}/${ano}`;
}

/** "2026-11-16T08:00:00-03:00" -> data e hora locais (o calendário já está no fuso de Brasília). */
function separar(iso: string) {
  return { data: iso.slice(0, 10), hora: iso.slice(11, 16) };
}

export default function Calendario({
  catalogo,
  podeEditar,
}: {
  catalogo: Catalogo;
  podeEditar: boolean;
}) {
  const professores = catalogo.professores;
  const calendario = useRef<CalendarRef>(null);
  const [dialogo, setDialogo] = useState<DadosAlocacao | null>(null);
  const [selecionados, setSelecionados] = useState<number[]>([]);
  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim] = useState("");

  const periodoInvalido =
    dataInicio !== "" && dataFim !== "" && dataFim < dataInicio;

  // "end" do FullCalendar é exclusivo: soma 1 dia para incluir a data de fim.
  const fimExclusivo = useMemo(() => {
    if (!dataFim) return undefined;
    const d = new Date(`${dataFim}T12:00:00Z`);
    d.setUTCDate(d.getUTCDate() + 1);
    return d.toISOString().slice(0, 10);
  }, [dataFim]);

  // Com início e fim preenchidos, mostra todos os dias do período de uma vez.
  const modoPeriodo = dataInicio !== "" && dataFim !== "" && !periodoInvalido;

  // No período longo, cada dia mantém uma largura mínima e a grade rola na horizontal.
  const LARGURA_MINIMA_DIA = 120;
  const larguraMinima = useMemo(() => {
    if (!modoPeriodo || !fimExclusivo) return undefined;
    const dias =
      (new Date(`${fimExclusivo}T12:00:00Z`).getTime() -
        new Date(`${dataInicio}T12:00:00Z`).getTime()) /
      86_400_000;
    const diasVisiveis = dias - Math.floor(dias / 7); // domingos ficam ocultos
    return Math.max(diasVisiveis, 1) * LARGURA_MINIMA_DIA + 60;
  }, [modoPeriodo, dataInicio, fimExclusivo]);

  // Com só uma das datas, continua semanal e limita até onde dá para navegar.
  const validRange = useMemo(() => {
    if (modoPeriodo || periodoInvalido) return undefined;
    if (!dataInicio && !fimExclusivo) return undefined;
    return { start: dataInicio || undefined, end: fimExclusivo };
  }, [modoPeriodo, periodoInvalido, dataInicio, fimExclusivo]);

  const buscarEventos = useCallback(
    async (info: { startStr: string; endStr: string }) => {
      // No servidor (pré-renderização) não busca nada; a busca acontece no navegador.
      if (typeof window === "undefined") return [];
      const params = new URLSearchParams({
        inicio: info.startStr,
        fim: info.endStr,
      });
      if (selecionados.length)
        params.set("professores", selecionados.join(","));
      const res = await fetch(`/api/alocacoes?${params}`);
      if (!res.ok) throw new Error("Falha ao carregar as alocações.");
      return res.json();
    },
    [selecionados],
  );

  function alternar(id: number) {
    setSelecionados((atual) =>
      atual.includes(id) ? atual.filter((x) => x !== id) : [...atual, id],
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-6 lg:flex-row lg:items-start">
      <aside className="flex w-full flex-col gap-4 lg:w-64 lg:shrink-0">
        <section className="cartao p-4">
          <h2 className="mb-3 text-xs font-semibold tracking-wide text-gray-500 uppercase">
            Professores
          </h2>
          <ul className="flex flex-col gap-1">
            {professores.map((p) => (
              <li key={p.id}>
                <label className="flex cursor-pointer items-center gap-2.5 rounded-md px-1.5 py-1 text-sm text-gray-700 hover:bg-gray-50">
                  <input
                    type="checkbox"
                    checked={selecionados.includes(p.id)}
                    onChange={() => alternar(p.id)}
                  />
                  <span
                    className="h-3 w-3 shrink-0 rounded-full"
                    style={{ background: p.cor }}
                  />
                  {p.nome}
                </label>
              </li>
            ))}
          </ul>
          {selecionados.length > 0 && (
            <button
              className="link mt-3 text-sm"
              onClick={() => setSelecionados([])}
            >
              Limpar filtro
            </button>
          )}
        </section>

        <section className="cartao flex flex-col gap-3 p-4">
          <h2 className="text-xs font-semibold tracking-wide text-gray-500 uppercase">
            Período
          </h2>
          <label className="rotulo">
            Data de início
            <input
              type="date"
              className="campo"
              value={dataInicio}
              onChange={(e) => setDataInicio(e.target.value)}
            />
          </label>
          <label className="rotulo">
            Data de fim
            <input
              type="date"
              className="campo"
              value={dataFim}
              onChange={(e) => setDataFim(e.target.value)}
            />
          </label>
          {periodoInvalido && (
            <p className="alerta-erro">
              A data de fim não pode ser anterior à data de início.
            </p>
          )}
        </section>
      </aside>

      <div className="cartao min-w-0 flex-1 overflow-x-auto p-3 sm:p-4">
        {modoPeriodo && (
          <p className="alerta-info mb-3">
            Mostrando de <strong>{formatarData(dataInicio)}</strong> a{" "}
            <strong>{formatarData(dataFim)}</strong>. Role para o lado para ver
            todos os dias.
          </p>
        )}
        <div style={larguraMinima ? { minWidth: larguraMinima } : undefined}>
          <FullCalendar
            // Recria o calendário ao trocar entre semana e período.
            key={modoPeriodo ? `periodo-${dataInicio}-${dataFim}` : "semana"}
            ref={calendario}
            plugins={[timeGridPlugin, interactionPlugin, formaTheme]}
            selectable={podeEditar}
            selectMirror
            select={(info) => {
              const inicio = separar(info.startStr);
              const fim = separar(info.endStr);
              setDialogo({
                data: inicio.data,
                horaInicio: inicio.hora,
                horaFim: fim.hora,
              });
              calendario.current?.getApi().unselect();
            }}
            eventClick={(info) => {
              const ev = info.event;
              const p = ev.extendedProps as Omit<
                DadosAlocacao,
                "data" | "horaInicio" | "horaFim"
              >;
              const inicio = separar(ev.startStr);
              const fim = separar(ev.endStr);
              setDialogo({
                ...p,
                id: Number(ev.id),
                data: inicio.data,
                horaInicio: inicio.hora,
                horaFim: fim.hora,
              });
            }}
            locale={ptBr}
            timeZone="America/Sao_Paulo"
            views={{
              periodo: {
                type: "timeGrid",
                visibleRange: {
                  start: dataInicio,
                  end: fimExclusivo ?? dataInicio,
                },
              },
            }}
            initialView={modoPeriodo ? "periodo" : "timeGridWeek"}
            headerToolbar={
              modoPeriodo
                ? false // o período já aparece nos filtros
                : { start: "today prev,next", center: "title", end: "" }
            }
            firstDay={1}
            hiddenDays={[0]}
            allDaySlot={false}
            slotMinTime="07:00:00"
            slotMaxTime="23:00:00"
            slotDuration="01:00:00"
            expandRows
            height="auto"
            nowIndicator
            validRange={validRange}
            events={buscarEventos}
            eventContent={(arg) => (
              <div className="overflow-hidden p-0.5 text-xs leading-tight">
                <div className="font-semibold">{arg.timeText}</div>
                <div>{arg.event.title}</div>
                <div>{String(arg.event.extendedProps.professor)}</div>
                {arg.event.extendedProps.turma ? (
                  <div className="opacity-80">
                    Turma {String(arg.event.extendedProps.turma)}
                  </div>
                ) : null}
              </div>
            )}
          />
        </div>
      </div>

      {dialogo && (
        <DialogoAlocacao
          key={`${dialogo.id ?? "nova"}-${dialogo.data}-${dialogo.horaInicio}`}
          dados={dialogo}
          catalogo={catalogo}
          podeEditar={podeEditar}
          aoFechar={() => setDialogo(null)}
          aoAlterar={() => calendario.current?.getApi().refetchEvents()}
        />
      )}
    </div>
  );
}
