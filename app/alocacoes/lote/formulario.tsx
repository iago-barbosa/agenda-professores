"use client";

import type { Catalogo } from "@/lib/catalogo";
import FormularioAcao from "@/app/ui/formulario-acao";
import CamposVinculo from "@/app/ui/campos-vinculo";
import { criarLote } from "../actions";

const DIAS = [
  { valor: 1, nome: "Seg" },
  { valor: 2, nome: "Ter" },
  { valor: 3, nome: "Qua" },
  { valor: 4, nome: "Qui" },
  { valor: 5, nome: "Sex" },
  { valor: 6, nome: "Sáb" },
];

function Secao({
  titulo,
  children,
}: {
  titulo: string;
  children: React.ReactNode;
}) {
  return (
    <fieldset className="flex flex-col gap-4 border-b border-gray-100 pb-5">
      <legend className="mb-3 text-sm font-semibold text-gray-900">
        {titulo}
      </legend>
      {children}
    </fieldset>
  );
}

export default function FormularioLote({ catalogo }: { catalogo: Catalogo }) {
  return (
    <FormularioAcao
      acao={criarLote}
      textoBotao="Criar aulas"
      limparAoSalvar
      className="flex flex-col gap-5"
    >
      <Secao titulo="O quê e quem">
        <CamposVinculo catalogo={catalogo} />
      </Secao>

      <Secao titulo="Quando">
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="rotulo">
            Início da UC
            <input name="dataInicio" type="date" required className="campo" />
          </label>
          <label className="rotulo">
            Fim da UC
            <input name="dataFim" type="date" required className="campo" />
          </label>
        </div>
        <div className="flex flex-col gap-2">
          <span className="text-sm font-medium text-gray-700">
            Dias da semana
          </span>
          <div className="flex flex-wrap gap-2">
            {DIAS.map((d) => (
              <label key={d.valor} className="cursor-pointer">
                <input
                  type="checkbox"
                  name="dias"
                  value={d.valor}
                  className="peer sr-only"
                />
                <span className="inline-flex h-9 min-w-14 items-center justify-center rounded-lg border border-gray-300 bg-white px-3 text-sm font-medium text-gray-700 transition select-none peer-checked:border-primaria peer-checked:bg-primaria peer-checked:text-white peer-focus-visible:ring-3 peer-focus-visible:ring-primaria/30">
                  {d.nome}
                </span>
              </label>
            ))}
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="rotulo">
            Hora de início
            <input
              name="horaInicio"
              type="time"
              required
              step={300}
              className="campo"
            />
          </label>
          <label className="rotulo">
            Hora de fim
            <input
              name="horaFim"
              type="time"
              required
              step={300}
              className="campo"
            />
          </label>
        </div>
      </Secao>
    </FormularioAcao>
  );
}
