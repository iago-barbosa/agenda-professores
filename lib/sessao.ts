import "server-only";
import { cookies } from "next/headers";
import { sealData, unsealData } from "iron-session";

// Sessão guardada em um cookie criptografado (iron-session).
export const COOKIE_SESSAO = "agenda_sessao";
const DURACAO_SEGUNDOS = 60 * 60 * 8; // 8 horas

export type Sessao = { usuarioId: number };

function senhaDaSessao() {
  const senha = process.env.SESSION_PASSWORD;
  if (!senha || senha.length < 32) {
    throw new Error(
      "Defina SESSION_PASSWORD no arquivo .env com pelo menos 32 caracteres (veja o .env.example).",
    );
  }
  return senha;
}

export async function lerSessao(): Promise<Sessao | null> {
  const valor = (await cookies()).get(COOKIE_SESSAO)?.value;
  if (!valor) return null;
  const dados = await unsealData<Partial<Sessao>>(valor, {
    password: senhaDaSessao(),
    ttl: DURACAO_SEGUNDOS,
  });
  return typeof dados.usuarioId === "number" ? { usuarioId: dados.usuarioId } : null;
}

export async function criarSessao(sessao: Sessao) {
  const valor = await sealData(sessao, { password: senhaDaSessao(), ttl: DURACAO_SEGUNDOS });
  (await cookies()).set(COOKIE_SESSAO, valor, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: DURACAO_SEGUNDOS,
  });
}

export async function encerrarSessao() {
  (await cookies()).delete(COOKIE_SESSAO);
}
