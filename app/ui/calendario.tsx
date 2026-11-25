"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import FullCalendar, { type CalendarRef } from "@fullcalendar/react";
import timeGridPlugin from "@fullcalendar/react/timegrid";
import dayGridPlugin from "@fullcalendar/react/daygrid";
import multiMonthPlugin from "@fullcalendar/react/multimonth";
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

type Visao = "timeGridWeek" | "dayGridMonth" | "multiMonthYear";

const DIAS_SEMANA = [
  "domingo",
  "segunda",
  "terça",
  "quarta",
  "quinta",
  "sexta",
  "sábado",
];

type Balao = {
  x: number;
  y: number;
  lado: "direita" | "esquerda";
  cor: string;
  uc: string;
  curso: string;
  professor: string;
  turma: string;
  data: string;
  horario: string;
  lote: boolean;
};

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
  const [balao, setBalao] = useState<Balao | null>(null);
  const [selecionados, setSelecionados] = useState<number[]>([]);
  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim] = useState("");
  // Visão escolhida (semana, mês ou ano); continua a mesma ao mexer nos filtros.
  const [visao, setVisao] = useState<Visao>("timeGridWeek");
  const temFiltro =
    selecionados.length > 0 || dataInicio !== "" || dataFim !== "";

  function limparFiltros() {
    setSelecionados([]);
    setDataInicio("");
    setDataFim("");
  }

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

  // Com só uma das datas, mantém a visão e limita até onde dá para navegar.
  // (A visão de ano do FullCalendar quebra com limite de navegação, então lá não limita.)
  const validRange = useMemo(() => {
    if (modoPeriodo || periodoInvalido || visao === "multiMonthYear")
      return undefined;
    if (!dataInicio && !fimExclusivo) return undefined;
    return { start: dataInicio || undefined, end: fimExclusivo };
  }, [modoPeriodo, periodoInvalido, visao, dataInicio, fimExclusivo]);

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
        <button
          type="button"
          onClick={limparFiltros}
          disabled={!temFiltro}
          className="botao botao-secundario w-full"
        >
          Limpar filtros
        </button>
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
          <div className="mt-3 flex gap-4 text-sm">
            <button
              type="button"
              className="link"
              onClick={() => setSelecionados(professores.map((p) => p.id))}
            >
              Marcar todos
            </button>
            {selecionados.length > 0 && (
              <button
                type="button"
                className="link"
                onClick={() => setSelecionados([])}
              >
                Desmarcar
              </button>
            )}
          </div>
          <p className="ajuda mt-2">Nenhum marcado = todos aparecem.</p>
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
            todos os dias. Para voltar à semana, mês ou ano, use{" "}
            <button type="button" className="link" onClick={limparFiltros}>
              Limpar filtros
            </button>
            .
          </p>
        )}
        <div style={larguraMinima ? { minWidth: larguraMinima } : undefined}>
          <FullCalendar
            // Recria o calendário ao trocar entre semana e período.
            key={modoPeriodo ? `periodo-${dataInicio}-${dataFim}` : "semana"}
            ref={calendario}
            plugins={[
              timeGridPlugin,
              dayGridPlugin,
              multiMonthPlugin,
              interactionPlugin,
              formaTheme,
            ]}
            selectable={podeEditar}
            selectMirror
            select={(info) => {
              const inicio = separar(info.startStr);
              const fim = separar(info.endStr);
              // No mês/ano a seleção é do dia inteiro: sugere um horário padrão.
              setDialogo(
                info.allDay
                  ? { data: inicio.data, horaInicio: "08:00", horaFim: "12:00" }
                  : {
                      data: inicio.data,
                      horaInicio: inicio.hora,
                      horaFim: fim.hora,
                    },
              );
              calendario.current?.getApi().unselect();
            }}
            eventMouseEnter={(info) => {
              const ev = info.event;
              const p = ev.extendedProps;
              const caixa = info.el.getBoundingClientRect();
              const inicio = separar(ev.startStr);
              const fim = separar(ev.endStr);
              const [a, m, d] = inicio.data.split("-").map(Number);
              const diaSemana = DIAS_SEMANA[new Date(a, m - 1, d).getDay()];
              // Abre à direita do bloco; se não couber na tela, abre à esquerda.
              const cabeADireita = caixa.right + 300 < window.innerWidth;
              setBalao({
                x: cabeADireita ? caixa.right + 8 : caixa.left - 8,
                y: Math.max(8, Math.min(caixa.top, window.innerHeight - 220)),
                lado: cabeADireita ? "direita" : "esquerda",
                cor: ev.color || "#0f6cbd",
                uc: ev.title,
                curso: String(p.curso ?? ""),
                professor: String(p.professor ?? ""),
                turma: String(p.turma ?? ""),
                data: `${diaSemana}, ${formatarData(inicio.data)}`,
                horario: `${inicio.hora} – ${fim.hora}`,
                lote: Boolean(p.serieId),
              });
            }}
            eventMouseLeave={() => setBalao(null)}
            eventClick={(info) => {
              setBalao(null);
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
            initialView={modoPeriodo ? "periodo" : visao}
            datesSet={(info) => {
              const tipo = info.view.type;
              if (
                tipo === "timeGridWeek" ||
                tipo === "dayGridMonth" ||
                tipo === "multiMonthYear"
              )
                setVisao(tipo);
            }}
            headerToolbar={
              modoPeriodo
                ? false // o período já aparece nos filtros
                : {
                    start: "today prev,next",
                    center: "title",
                    end: "timeGridWeek,dayGridMonth,multiMonthYear",
                  }
            }
            buttons={{
              today: { text: "Hoje" },
              timeGridWeek: { text: "Semana" },
              dayGridMonth: { text: "Mês" },
              multiMonthYear: { text: "Ano" },
            }}
            // No mês/ano, clicar no número do dia abre a semana daquele dia.
            navLinks
            navLinkDayClick={(data) => {
              const api = calendario.current?.getApi();
              api?.changeView("timeGridWeek", data);
            }}
            dayMaxEventRows={3}
            multiMonthMaxColumns={3}
            displayEventEnd
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
            eventContent={(arg) =>
              arg.view.type !== "timeGridWeek" &&
              arg.view.type !== "periodo" ? (
                // Mês e ano: uma linha só (hora, UC e professor); a bolinha de cor já vem do calendário.
                <div className="flex min-w-0 items-center gap-1 overflow-hidden px-0.5 text-xs">
                  <span className="shrink-0 font-semibold">{arg.timeText}</span>
                  <span className="truncate">
                    {arg.event.title} ·{" "}
                    {String(arg.event.extendedProps.professor)}
                  </span>
                </div>
              ) : (
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
              )
            }
          />
        </div>
      </div>

      {balao && (
        <div
          role="tooltip"
          className="pointer-events-none fixed z-50 w-72 rounded-xl border border-gray-200 bg-white p-4 text-sm text-gray-700 shadow-xl"
          style={{
            top: balao.y,
            left: balao.x,
            transform:
              balao.lado === "esquerda" ? "translateX(-100%)" : undefined,
            borderTop: `4px solid ${balao.cor}`,
          }}
        >
          <p className="text-base leading-snug font-semibold text-gray-900">
            {balao.uc}
          </p>
          <p className="mb-3 text-gray-500">{balao.curso}</p>
          <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1">
            <dt className="text-gray-500">Professor</dt>
            <dd className="flex items-center gap-1.5 font-medium text-gray-900">
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{ background: balao.cor }}
              />
              {balao.professor}
            </dd>
            <dt className="text-gray-500">Turma</dt>
            <dd>{balao.turma || "—"}</dd>
            <dt className="text-gray-500">Data</dt>
            <dd>{balao.data}</dd>
            <dt className="text-gray-500">Horário</dt>
            <dd>{balao.horario}</dd>
          </dl>
          {balao.lote && (
            <p className="mt-3 text-xs text-gray-500">
              Faz parte de uma alocação em lote.
            </p>
          )}
          <p className="mt-2 text-xs text-gray-400">
            {podeEditar ? "Clique para editar." : "Clique para ver detalhes."}
          </p>
        </div>
      )}

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
