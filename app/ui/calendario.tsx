"use client";

import { useCallback, useMemo, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import timeGridPlugin from "@fullcalendar/react/timegrid";
import formaTheme from "@fullcalendar/react/themes/forma";
import ptBr from "@fullcalendar/react/locales/pt-br";
import "@fullcalendar/react/skeleton.css";
import "@fullcalendar/react/themes/forma/theme.css";
import "@fullcalendar/react/themes/forma/palettes/blue.css";

type Professor = { id: number; nome: string; cor: string };

export default function Calendario({ professores }: { professores: Professor[] }) {
  const [selecionados, setSelecionados] = useState<number[]>([]);
  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim] = useState("");

  const periodoInvalido = dataInicio !== "" && dataFim !== "" && dataFim < dataInicio;

  // Período permitido para navegação (filtro de data início/fim).
  const validRange = useMemo(() => {
    if (periodoInvalido) return undefined;
    const r: { start?: string; end?: string } = {};
    if (dataInicio) r.start = dataInicio;
    if (dataFim) {
      // "end" do FullCalendar é exclusivo: soma 1 dia para incluir a data de fim.
      const d = new Date(`${dataFim}T12:00:00Z`);
      d.setUTCDate(d.getUTCDate() + 1);
      r.end = d.toISOString().slice(0, 10);
    }
    return r.start || r.end ? r : undefined;
  }, [dataInicio, dataFim, periodoInvalido]);

  const buscarEventos = useCallback(
    async (info: { startStr: string; endStr: string }) => {
      // No servidor (pré-renderização) não busca nada; a busca acontece no navegador.
      if (typeof window === "undefined") return [];
      const params = new URLSearchParams({ inicio: info.startStr, fim: info.endStr });
      if (selecionados.length) params.set("professores", selecionados.join(","));
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
    <div className="flex flex-1 flex-col gap-4 lg:flex-row">
      <aside className="flex w-full flex-col gap-6 lg:w-64 lg:shrink-0">
        <section>
          <h2 className="mb-2 text-sm font-semibold">Professores</h2>
          <ul className="flex flex-col gap-1">
            {professores.map((p) => (
              <li key={p.id}>
                <label className="flex cursor-pointer items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={selecionados.includes(p.id)}
                    onChange={() => alternar(p.id)}
                  />
                  <span className="h-3 w-3 rounded-sm" style={{ background: p.cor }} />
                  {p.nome}
                </label>
              </li>
            ))}
          </ul>
          {selecionados.length > 0 && (
            <button
              className="mt-2 text-sm text-blue-700 underline"
              onClick={() => setSelecionados([])}
            >
              Limpar filtro
            </button>
          )}
        </section>

        <section className="flex flex-col gap-2">
          <h2 className="text-sm font-semibold">Período</h2>
          <label className="flex flex-col text-sm">
            Data de início
            <input
              type="date"
              className="rounded border px-2 py-1"
              value={dataInicio}
              onChange={(e) => setDataInicio(e.target.value)}
            />
          </label>
          <label className="flex flex-col text-sm">
            Data de fim
            <input
              type="date"
              className="rounded border px-2 py-1"
              value={dataFim}
              onChange={(e) => setDataFim(e.target.value)}
            />
          </label>
          {periodoInvalido && (
            <p className="text-sm text-red-700">
              A data de fim não pode ser anterior à data de início.
            </p>
          )}
        </section>
      </aside>

      <div className="min-w-0 flex-1">
        <FullCalendar
          plugins={[timeGridPlugin, formaTheme]}
          locale={ptBr}
          timeZone="America/Sao_Paulo"
          initialView="timeGridWeek"
          headerToolbar={{ start: "today prev,next", center: "title", end: "" }}
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
              <div className="opacity-80">Turma {String(arg.event.extendedProps.turma)}</div>
            </div>
          )}
        />
      </div>
    </div>
  );
}
