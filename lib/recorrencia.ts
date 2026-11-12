// Geração das ocorrências de uma alocação em lote (SerieAlocacao).
// Todos os horários são do fuso de Brasília (UTC-03:00, sem horário de verão desde 2019).

export const FUSO = "-03:00";

export type DadosSerie = {
  dataInicio: string; // "AAAA-MM-DD"
  dataFim: string; // "AAAA-MM-DD"
  diasSemana: number[]; // 0 = domingo ... 6 = sábado
  horaInicio: string; // "HH:MM"
  horaFim: string; // "HH:MM"
};

export type Ocorrencia = { inicio: Date; fim: Date };

const DATA = /^\d{4}-\d{2}-\d{2}$/;
const HORA = /^([01]\d|2[0-3]):[0-5]\d$/;

/** Devolve a lista de erros de validação (vazia quando a série é válida). */
export function validarSerie(s: DadosSerie): string[] {
  const erros: string[] = [];
  if (!DATA.test(s.dataInicio)) erros.push("Data de início inválida.");
  if (!DATA.test(s.dataFim)) erros.push("Data de fim inválida.");
  if (DATA.test(s.dataInicio) && DATA.test(s.dataFim) && s.dataFim < s.dataInicio)
    erros.push("A data de fim não pode ser anterior à data de início.");
  if (s.diasSemana.length === 0) erros.push("Escolha pelo menos um dia da semana.");
  if (s.diasSemana.some((d) => !Number.isInteger(d) || d < 0 || d > 6))
    erros.push("Dia da semana inválido.");
  if (!HORA.test(s.horaInicio)) erros.push("Hora de início inválida.");
  if (!HORA.test(s.horaFim)) erros.push("Hora de fim inválida.");
  if (HORA.test(s.horaInicio) && HORA.test(s.horaFim) && s.horaFim <= s.horaInicio)
    erros.push("A hora de fim precisa ser depois da hora de início.");
  return erros;
}

/** Converte data + hora locais (Brasília) em um Date. */
export function dataHoraLocal(data: string, hora: string): Date {
  return new Date(`${data}T${hora}:00${FUSO}`);
}

/** Gera uma ocorrência para cada data do período que cai em um dos dias da semana escolhidos. */
export function gerarOcorrencias(s: DadosSerie): Ocorrencia[] {
  const erros = validarSerie(s);
  if (erros.length) throw new Error(erros.join(" "));

  const dias = new Set(s.diasSemana);
  const ocorrencias: Ocorrencia[] = [];
  // Percorre as datas em UTC ao meio-dia para não sofrer com fuso.
  const atual = new Date(`${s.dataInicio}T12:00:00Z`);
  const fim = new Date(`${s.dataFim}T12:00:00Z`);
  while (atual <= fim) {
    if (dias.has(atual.getUTCDay())) {
      const data = atual.toISOString().slice(0, 10);
      ocorrencias.push({
        inicio: dataHoraLocal(data, s.horaInicio),
        fim: dataHoraLocal(data, s.horaFim),
      });
    }
    atual.setUTCDate(atual.getUTCDate() + 1);
  }
  return ocorrencias;
}
