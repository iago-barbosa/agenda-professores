"use server";

import { prisma } from "@/lib/prisma";
import { exigirUsuario } from "@/lib/auth";
import { conferirSenha, gerarHashSenha, TAMANHO_MINIMO_SENHA } from "@/lib/senha";
import { executar, ErroFormulario, type EstadoAcao } from "@/lib/formulario";

/** O próprio usuário troca a senha, confirmando a senha atual. */
export async function alterarSenha(_: EstadoAcao, formData: FormData) {
  const usuarioAtual = await exigirUsuario();
  return executar(async () => {
    const atual = String(formData.get("senhaAtual") ?? "");
    const nova = String(formData.get("novaSenha") ?? "");
    const confirmacao = String(formData.get("confirmarSenha") ?? "");

    if (!atual) throw new ErroFormulario("Informe a senha atual.");
    if (nova.length < TAMANHO_MINIMO_SENHA)
      throw new ErroFormulario(`A nova senha precisa ter pelo menos ${TAMANHO_MINIMO_SENHA} caracteres.`);
    if (nova !== confirmacao) throw new ErroFormulario("A confirmação não confere com a nova senha.");
    if (nova === atual) throw new ErroFormulario("A nova senha precisa ser diferente da atual.");

    const usuario = await prisma.usuario.findUnique({ where: { id: usuarioAtual.id } });
    if (!usuario || !(await conferirSenha(atual, usuario.senhaHash))) {
      throw new ErroFormulario("A senha atual está incorreta.");
    }

    await prisma.usuario.update({
      where: { id: usuario.id },
      data: { senhaHash: await gerarHashSenha(nova) },
    });
    return "Senha alterada. Use a nova senha no próximo login.";
  });
}
