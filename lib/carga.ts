// Controle da carga horária das UCs: horas já alocadas em cada par UC + turma.
// A carga horária é da UC; cada turma que cursa a UC precisa cumprir essa carga.

/** Duração em horas de uma aula. */
export function duracaoHoras(inicio: Date, fim: Date) {
  return (fim.getTime() - inicio.getTime()) / 3_600_000;
}

/** Formata horas como "12h" ou "12h30". */
export function formatarHoras(horas: number) {
  const minutos = Math.round(horas * 60);
  const h = Math.floor(Math.abs(minutos) / 60);
  const m = Math.abs(minutos) % 60;
  const sinal = minutos < 0 ? "-" : "";
  return m ? `${sinal}${h}h${String(m).padStart(2, "0")}` : `${sinal}${h}h`;
}

/** Chave do mapa de horas por UC e turma. */
export const chaveUcTurma = (ucId: number, turmaId: number) => `${ucId}-${turmaId}`;
