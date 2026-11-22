import "server-only";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { lerSessao } from "@/lib/sessao";
import type { Papel } from "@/app/generated/prisma/client";

export type UsuarioAtual = {
  id: number;
  nome: string;
  papel: Papel;
  professorId: number | null;
};

/** Usuário logado, ou null. Confere no banco se ele ainda existe e está ativo. */
export async function buscarUsuarioAtual(): Promise<UsuarioAtual | null> {
  const sessao = await lerSessao();
  if (!sessao) return null;
  const usuario = await prisma.usuario.findUnique({
    where: { id: sessao.usuarioId },
    select: { id: true, nome: true, papel: true, professorId: true, ativo: true },
  });
  if (!usuario || !usuario.ativo) return null;
  return {
    id: usuario.id,
    nome: usuario.nome,
    papel: usuario.papel,
    professorId: usuario.professorId,
  };
}

/** Para páginas: manda para o login quando não há usuário. */
export async function exigirUsuario(): Promise<UsuarioAtual> {
  const usuario = await buscarUsuarioAtual();
  if (!usuario) redirect("/login");
  return usuario;
}

/** Para páginas e ações que alteram dados: só o Admin passa. */
export async function exigirAdmin(): Promise<UsuarioAtual> {
  const usuario = await exigirUsuario();
  if (usuario.papel !== "ADMIN") redirect("/");
  return usuario;
}
