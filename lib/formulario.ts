// Ajudantes para ler e validar campos de formulários nas Server Actions.

export type EstadoAcao = {
  erro?: string;
  ok?: string;
  /** Muda a cada sucesso, para o formulário saber que pode limpar os campos. */
  versao?: number;
  /** Conflitos de horário encontrados, quando a ação pede confirmação. */
  conflitos?: { data: string; motivo: string }[];
};

export class ErroFormulario extends Error {}

export function texto(formData: FormData, campo: string, rotulo: string, obrigatorio = true) {
  const valor = String(formData.get(campo) ?? "").trim();
  if (obrigatorio && !valor) throw new ErroFormulario(`Preencha o campo ${rotulo}.`);
  return valor;
}

export function inteiro(formData: FormData, campo: string, rotulo: string, obrigatorio = true) {
  const bruto = String(formData.get(campo) ?? "").trim();
  if (!bruto) {
    if (obrigatorio) throw new ErroFormulario(`Preencha o campo ${rotulo}.`);
    return null;
  }
  const n = Number(bruto);
  if (!Number.isInteger(n) || n < 0) throw new ErroFormulario(`${rotulo} inválido.`);
  return n;
}

/** Executa a ação e transforma erros de validação em mensagem para a tela. */
export async function executar(
  fn: () => Promise<string | EstadoAcao>,
): Promise<EstadoAcao> {
  try {
    const r = await fn();
    return typeof r === "string" ? { ok: r, versao: Date.now() } : r;
  } catch (e) {
    if (e instanceof ErroFormulario) return { erro: e.message };
    // Erros de chave única do Prisma (ex.: e-mail repetido)
    if (typeof e === "object" && e && "code" in e && e.code === "P2002") {
      return { erro: "Já existe um registro com esse valor." };
    }
    throw e;
  }
}
