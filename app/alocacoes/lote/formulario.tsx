"use client";

import type { Catalogo } from "@/lib/catalogo";
import FormularioAcao from "@/app/ui/formulario-acao";
import CamposVinculo from "@/app/ui/campos-vinculo";
import { campo, rotulo } from "@/app/ui/estilos";
import { criarLote } from "../actions";

const DIAS = [
  { valor: 1, nome: "Seg" },
  { valor: 2, nome: "Ter" },
  { valor: 3, nome: "Qua" },
  { valor: 4, nome: "Qui" },
  { valor: 5, nome: "Sex" },
  { valor: 6, nome: "Sáb" },
];

export default function FormularioLote({ catalogo }: { catalogo: Catalogo }) {
  return (
    <FormularioAcao acao={criarLote} textoBotao="Criar aulas" className="flex max-w-2xl flex-col gap-4">
      <CamposVinculo catalogo={catalogo} />
      <div className="grid gap-3 sm:grid-cols-2">
        <label className={rotulo}>
          Data de início da UC
          <input name="dataInicio" type="date" required className={campo} />
        </label>
        <label className={rotulo}>
          Data de fim da UC
          <input name="dataFim" type="date" required className={campo} />
        </label>
      </div>
      <fieldset className="flex flex-col gap-1 text-sm">
        <legend className="mb-1">Dias da semana</legend>
        <div className="flex flex-wrap gap-4">
          {DIAS.map((d) => (
            <label key={d.valor} className="flex items-center gap-1">
              <input type="checkbox" name="dias" value={d.valor} />
              {d.nome}
            </label>
          ))}
        </div>
      </fieldset>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className={rotulo}>
          Hora de início
          <input name="horaInicio" type="time" required step={300} className={campo} />
        </label>
        <label className={rotulo}>
          Hora de fim
          <input name="horaFim" type="time" required step={300} className={campo} />
        </label>
      </div>
    </FormularioAcao>
  );
}
