"use server";

import { refresh } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { exigirAdmin } from "@/lib/auth";
import { gerarHashSenha, TAMANHO_MINIMO_SENHA } from "@/lib/senha";
import { executar, texto, ErroFormulario, type EstadoAcao } from "@/lib/formulario";

function lerProfessor(formData: FormData) {
  const nome = texto(formData, "nome", "Nome");
  const email = texto(formData, "email", "E-mail", false).toLowerCase() || null;
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new ErroFormulario("E-mail inválido.");
  const cor = texto(formData, "cor", "Cor");
  if (!/^#[0-9a-fA-F]{6}$/.test(cor)) throw new ErroFormulario("Cor inválida.");
  const ativo = formData.get("ativo") !== null;
  return { nome, email, cor, ativo };
}

/** Senha digitada no formulário (vazia = não mexer na senha). */
function lerSenha(formData: FormData) {
  const senha = String(formData.get("senha") ?? "");
  const confirmacao = String(formData.get("confirmarSenha") ?? "");
  if (!senha && !confirmacao) return null;
  if (senha.length < TAMANHO_MINIMO_SENHA)
    throw new ErroFormulario(`A senha precisa ter pelo menos ${TAMANHO_MINIMO_SENHA} caracteres.`);
  if (senha !== confirmacao) throw new ErroFormulario("A confirmação não confere com a senha.");
  return senha;
}

/** O e-mail de login não pode estar em uso por outro usuário (ex.: o Admin). */
async function conferirEmailLivre(email: string, usuarioId?: number) {
  const outro = await prisma.usuario.findUnique({ where: { email } });
  if (outro && outro.id !== usuarioId) {
    throw new ErroFormulario("Esse e-mail já é usado por outro usuário do sistema.");
  }
}

export async function criarProfessor(_: EstadoAcao, formData: FormData) {
  await exigirAdmin();
  return executar(async () => {
    const dados = lerProfessor(formData);
    const senha = lerSenha(formData);
    if (senha && !dados.email) throw new ErroFormulario("Para liberar o acesso, informe o e-mail do professor.");
    if (senha && dados.email) await conferirEmailLivre(dados.email);
    const senhaHash = senha ? await gerarHashSenha(senha) : null;

    await prisma.professor.create({
      data: {
        ...dados,
        ativo: true,
        ...(senhaHash && dados.email
          ? { usuario: { create: { nome: dados.nome, email: dados.email, senhaHash, papel: "PROFESSOR" } } }
          : {}),
      },
    });
    refresh();
    return senhaHash
      ? `Professor ${dados.nome} cadastrado. Ele já pode entrar com ${dados.email}.`
      : `Professor ${dados.nome} cadastrado.`;
  });
}

export async function editarProfessor(id: number, _: EstadoAcao, formData: FormData) {
  await exigirAdmin();
  return executar(async () => {
    const dados = lerProfessor(formData);
    const senha = lerSenha(formData);
    const acesso = formData.get("acesso") !== null;
    const usuario = await prisma.usuario.findUnique({ where: { professorId: id } });

    if (usuario) {
      // Já tem login: mantém e-mail e nome em dia, troca a senha se veio uma nova.
      if (!dados.email) throw new ErroFormulario("O e-mail é usado para entrar no sistema e não pode ficar vazio.");
      await conferirEmailLivre(dados.email, usuario.id);
      const senhaHash = senha ? await gerarHashSenha(senha) : undefined;
      await prisma.$transaction([
        prisma.professor.update({ where: { id }, data: dados }),
        prisma.usuario.update({
          where: { id: usuario.id },
          data: { nome: dados.nome, email: dados.email, ativo: acesso, ...(senhaHash ? { senhaHash } : {}) },
        }),
      ]);
    } else if (senha) {
      // Ainda não tinha login: a senha inicial libera o acesso.
      if (!dados.email) throw new ErroFormulario("Para liberar o acesso, informe o e-mail do professor.");
      await conferirEmailLivre(dados.email);
      const senhaHash = await gerarHashSenha(senha);
      await prisma.professor.update({
        where: { id },
        data: {
          ...dados,
          usuario: { create: { nome: dados.nome, email: dados.email, senhaHash, papel: "PROFESSOR" } },
        },
      });
    } else {
      await prisma.professor.update({ where: { id }, data: dados });
    }

    refresh();
    return senha ? "Alterações salvas. A nova senha já vale para o próximo login." : "Alterações salvas.";
  });
}

export async function excluirProfessor(id: number): Promise<EstadoAcao> {
  await exigirAdmin();
  const total = await prisma.alocacao.count({ where: { professorId: id } });
  if (total > 0) {
    return {
      erro: `Tem ${total} alocação(ões). Exclua as alocações ou desmarque "Ativo" para esconder o professor.`,
    };
  }
  await prisma.$transaction([
    // Remove também o login do professor, para não sobrar um acesso sem cadastro.
    prisma.usuario.deleteMany({ where: { professorId: id, papel: "PROFESSOR" } }),
    prisma.serieAlocacao.deleteMany({ where: { professorId: id } }),
    prisma.professor.delete({ where: { id } }),
  ]);
  redirect("/professores");
}
