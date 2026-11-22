"use client";

import { useState } from "react";
import type { Catalogo } from "@/lib/catalogo";
import { campo, rotulo } from "@/app/ui/estilos";

/** Professor, curso, UC e turma. UC e turma mostram só as do curso escolhido. */
export default function CamposVinculo({
  catalogo,
  inicial,
}: {
  catalogo: Catalogo;
  inicial?: { professorId?: number; cursoId?: number; ucId?: number; turmaId?: number };
}) {
  const [cursoId, setCursoId] = useState<number | "">(inicial?.cursoId ?? "");
  const curso = catalogo.cursos.find((c) => c.id === cursoId);

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <label className={rotulo}>
        Professor
        <select name="professorId" required defaultValue={inicial?.professorId ?? ""} className={campo}>
          <option value="" disabled>
            Escolha…
          </option>
          {catalogo.professores.map((p) => (
            <option key={p.id} value={p.id}>
              {p.nome}
            </option>
          ))}
        </select>
      </label>
      <label className={rotulo}>
        Curso
        <select
          required
          value={cursoId}
          onChange={(e) => setCursoId(e.target.value ? Number(e.target.value) : "")}
          className={campo}
        >
          <option value="" disabled>
            Escolha…
          </option>
          {catalogo.cursos.map((c) => (
            <option key={c.id} value={c.id}>
              {c.nome}
            </option>
          ))}
        </select>
      </label>
      {/* key: ao trocar de curso, volta a pedir a escolha da UC e da turma */}
      <label className={rotulo}>
        UC
        <select
          key={`uc-${cursoId}`}
          name="ucId"
          required
          disabled={!curso}
          defaultValue={curso && curso.id === inicial?.cursoId ? inicial?.ucId : curso?.ucs.length === 1 ? curso.ucs[0].id : ""}
          className={campo}
        >
          <option value="" disabled>
            {curso ? "Escolha…" : "Escolha o curso primeiro"}
          </option>
          {curso?.ucs.map((u) => (
            <option key={u.id} value={u.id}>
              {u.nome}
            </option>
          ))}
        </select>
      </label>
      <label className={rotulo}>
        Turma
        <select
          key={`turma-${cursoId}`}
          name="turmaId"
          required
          disabled={!curso}
          defaultValue={curso && curso.id === inicial?.cursoId ? inicial?.turmaId : ""}
          className={campo}
        >
          <option value="" disabled>
            {curso ? "Escolha…" : "Escolha o curso primeiro"}
          </option>
          {curso?.turmas.map((t) => (
            <option key={t.id} value={t.id}>
              {t.codigo}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}
