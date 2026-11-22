"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { conferirSenha } from "@/lib/senha";
import { criarSessao, encerrarSessao } from "@/lib/sessao";

export type EstadoLogin = { erro?: string; email?: string };

// Hash usado quando o e-mail não existe, para a resposta levar o mesmo tempo.
const HASH_FALSO = "$2b$12$gLKqfMsnAN2ArR04.TpSsuL7RFsBHUBzc7VJ/0W7W2PR1MWoRrsNq";

export async function entrar(_anterior: EstadoLogin, formData: FormData): Promise<EstadoLogin> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const senha = String(formData.get("senha") ?? "");
  if (!email || !senha) return { erro: "Informe e-mail e senha.", email };

  const usuario = await prisma.usuario.findUnique({ where: { email } });
  const senhaOk = await conferirSenha(senha, usuario?.senhaHash ?? HASH_FALSO);
  if (!usuario || !senhaOk || !usuario.ativo) {
    return { erro: "E-mail ou senha incorretos.", email };
  }

  await criarSessao({ usuarioId: usuario.id });
  redirect("/");
}

export async function sair() {
  await encerrarSessao();
  redirect("/login");
}
