"use client";

import { useId, useState } from "react";
import type { Catalogo } from "@/lib/catalogo";

const NOME_MODALIDADE = {
  TECNICO: "Técnico",
  APRENDIZAGEM: "Aprendizagem",
  APERFEICOAMENTO: "Aperfeiçoamento",
} as const;

const limpar = (s: string) => s.trim().replace(/\s+/g, " ");
const igual = (a: string, b: string) =>
  limpar(a).localeCompare(limpar(b), "pt-BR", { sensitivity: "base" }) === 0;

/**
 * Professor (lista) + curso, UC e turma digitáveis, com sugestões do que já existe.
 * O que não existir é cadastrado ao salvar.
 */
export default function CamposVinculo({
  catalogo,
  inicial,
}: {
  catalogo: Catalogo;
  inicial?: {
    professorId?: number;
    curso?: string;
    uc?: string;
    turma?: string;
  };
}) {
  const id = useId();
  const [curso, setCurso] = useState(inicial?.curso ?? "");
  const [uc, setUc] = useState(inicial?.uc ?? "");
  const [turma, setTurma] = useState(inicial?.turma ?? "");
  const [modalidade, setModalidade] = useState("");

  const cursoExistente = catalogo.cursos.find((c) => igual(c.nome, curso));
  const ucExistente = cursoExistente?.ucs.find((u) => igual(u.nome, uc));
  const turmaExistente = cursoExistente?.turmas.find((t) =>
    igual(t.codigo, turma),
  );
  const novo = (texto: string, existe: unknown) =>
    limpar(texto) !== "" && !existe;

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <label className="rotulo">
        Professor
        <select
          name="professorId"
          required
          defaultValue={inicial?.professorId ?? ""}
          className="campo"
        >
          <option value="" disabled>
            Escolha o professor…
          </option>
          {catalogo.professores.map((p) => (
            <option key={p.id} value={p.id}>
              {p.nome}
            </option>
          ))}
        </select>
      </label>

      <label className="rotulo">
        Curso
        <input
          name="curso"
          required
          list={`${id}-cursos`}
          value={curso}
          onChange={(e) => setCurso(e.target.value)}
          placeholder="Digite ou escolha um curso"
          autoComplete="off"
          className="campo"
        />
        <datalist id={`${id}-cursos`}>
          {catalogo.cursos.map((c) => (
            <option key={c.id} value={c.nome} />
          ))}
        </datalist>
        {novo(curso, cursoExistente) && (
          <span className="ajuda">Curso novo: será cadastrado ao salvar.</span>
        )}
      </label>

      {cursoExistente ? (
        <input
          type="hidden"
          name="modalidade"
          value={cursoExistente.modalidade}
        />
      ) : (
        novo(curso, cursoExistente) && (
          <label className="rotulo sm:col-span-2">
            Modalidade do novo curso
            <select
              name="modalidade"
              required
              value={modalidade}
              onChange={(e) => setModalidade(e.target.value)}
              className="campo sm:max-w-xs"
            >
              <option value="" disabled>
                Escolha…
              </option>
              {Object.entries(NOME_MODALIDADE).map(([valor, nome]) => (
                <option key={valor} value={valor}>
                  {nome}
                </option>
              ))}
            </select>
          </label>
        )
      )}

      <label className="rotulo">
        UC (Unidade Curricular)
        <input
          name="uc"
          required
          list={`${id}-ucs`}
          value={uc}
          onChange={(e) => setUc(e.target.value)}
          placeholder="Digite ou escolha a UC"
          autoComplete="off"
          className="campo"
        />
        <datalist id={`${id}-ucs`}>
          {cursoExistente?.ucs.map((u) => (
            <option key={u.id} value={u.nome} />
          ))}
        </datalist>
        {novo(uc, ucExistente) && (
          <span className="ajuda">UC nova: será cadastrada ao salvar.</span>
        )}
      </label>

      <label className="rotulo">
        Turma
        <input
          name="turma"
          required
          list={`${id}-turmas`}
          value={turma}
          onChange={(e) => setTurma(e.target.value)}
          placeholder="Ex.: TDS-2027-1"
          autoComplete="off"
          className="campo"
        />
        <datalist id={`${id}-turmas`}>
          {cursoExistente?.turmas.map((t) => (
            <option key={t.id} value={t.codigo} />
          ))}
        </datalist>
        {novo(turma, turmaExistente) && (
          <span className="ajuda">Turma nova: será cadastrada ao salvar.</span>
        )}
      </label>

      {novo(uc, ucExistente) && (
        <label className="rotulo">
          Carga horária da UC (opcional)
          <input
            name="cargaHoraria"
            type="number"
            min={0}
            placeholder="Horas"
            className="campo sm:max-w-40"
          />
        </label>
      )}
    </div>
  );
}
