# Agenda de Professores

Calendário de alocação dos professores, no estilo de visualização do Outlook.

Stack: Next.js 16, React 19, TypeScript, Tailwind 4, FullCalendar 7 e Prisma 7 com SQLite (arquivo local em desenvolvimento, Turso em produção).

## Como rodar

Requer **Node.js 22 ou mais novo** (o Prisma e o SQLite não funcionam no Node 20). Com o nvm: `nvm install 22` e `nvm use 22`.

```bash
npm install                      # instala as dependências e gera o cliente do Prisma
copy .env.example .env           # no Windows (no Linux/macOS: cp .env.example .env)
npm run db:migrate               # cria o banco local dev.db
npm run db:exemplo               # opcional: dados e contas de exemplo (apaga o banco local!)
npm run dev
```

Abra http://localhost:3000. No `.env`, troque o `SESSION_PASSWORD` por uma chave aleatória (o comando para gerar está no `.env.example`).

## Login e perfis

| Perfil | Pode |
| --- | --- |
| Admin | Ver e editar tudo |
| Professor | Só visualizar (a própria agenda e a dos outros professores) |

Sem o `db:exemplo`, o banco começa **vazio**, sem nenhuma conta: crie o primeiro Admin com `npm run usuario:criar` (abaixo). O `db:exemplo` cria dois usuários só para desenvolvimento, `admin@exemplo.com` / `admin12345` (Admin) e `ana@exemplo.com` / `professor123` (Professor), e se recusa a rodar no banco de produção ou num banco que já tenha contas reais.

O Admin libera o acesso de um professor na tela **Professores**: basta informar o e-mail e uma senha inicial ao cadastrar (ou na edição do professor). Na edição também dá para trocar a senha e bloquear o acesso sem apagar o professor. O professor entra com esse e-mail e senha e só visualiza o calendário, com o atalho "Minha agenda".

Para criar ou atualizar um usuário pelo terminal (por exemplo, o primeiro Admin):

```bash
npm run usuario:criar -- --nome "Fulano" --email fulano@escola.com --senha "senhaForte123" --papel ADMIN
npm run usuario:criar -- --nome "Ana" --email ana@escola.com --senha "senhaForte123" --papel PROFESSOR --professor 1
```

`--professor` é o id do cadastro do professor (opcional).

## Publicar de graça (Vercel + Turso)

O banco de produção fica no [Turso](https://turso.tech) (SQLite na nuvem) e o site na [Vercel](https://vercel.com). Os dois têm plano gratuito.

1. **Turso:** crie a conta e um banco (pelo site ou com `turso db create agenda`). Pegue a URL (`libsql://…`) e gere um token (`turso db tokens create agenda`).
2. **Criar as tabelas e o Admin**, no seu computador: coloque no `.env` as linhas `TURSO_DATABASE_URL="libsql://…"` e `TURSO_AUTH_TOKEN="…"` e rode:
   ```bash
   npm run db:migrar-turso
   npm run usuario:criar -- --nome "Seu Nome" --email voce@escola.com --senha "senhaForte123" --papel ADMIN
   ```
   Depois **tire ou comente** as duas linhas do Turso no `.env`, para o `npm run dev` voltar a usar o `dev.db`.
3. **Vercel:** importe o repositório do GitHub e, em *Settings → Environment Variables*, cadastre `TURSO_DATABASE_URL`, `TURSO_AUTH_TOKEN` e `SESSION_PASSWORD` (uma chave nova, diferente da de desenvolvimento). Faça o deploy.
4. **Novas migrações:** depois de criar uma migração com `npm run db:migrate`, rode `npm run db:migrar-turso` (com as variáveis do Turso) antes de publicar.

Com `TURSO_DATABASE_URL` definida, o sistema usa o Turso; sem ela, usa o arquivo de `DATABASE_URL` (`lib/prisma.ts`).

## Estrutura

| Caminho | O que tem |
| --- | --- |
| `prisma/schema.prisma` | Modelo de dados: Professor, Curso (com Modalidade), UC, Turma, SerieAlocacao (lote) e Alocacao (cada bloco do calendário) |
| `prisma/exemplo.ts` | Dados e contas de exemplo, só para desenvolvimento (`npm run db:exemplo`) |
| `scripts/migrar-turso.ts` | Aplica as migrações no banco do Turso (`npm run db:migrar-turso`) |
| `lib/recorrencia.ts` | Validação e geração das ocorrências de uma alocação em lote |
| `lib/prisma.ts` | Conexão com o banco (Turso em produção, arquivo local em desenvolvimento) |
| `app/api/alocacoes/route.ts` | `GET /api/alocacoes?inicio=&fim=&professores=1,2` |
| `app/ui/calendario.tsx` | Calendário semanal com filtros por professor e período |
| `app/login/` | Tela de login e ações de entrar e sair |
| `app/senha/` | Tela para o usuário logado trocar a própria senha |
| `app/professores/` | Cadastro de professores (só Admin) |
| `app/cursos/` | Cadastro de cursos, com UCs e turmas (só Admin) |
| `app/alocacoes/actions.ts` | Criar, editar e excluir alocações e alocação em lote |
| `app/alocacoes/lote/` | Tela de alocação em lote por UC (só Admin) |
| `app/ui/dialogo-alocacao.tsx` | Janela de criar, editar, excluir ou ver detalhes de uma aula |
| `lib/carga.ts`, `lib/carga-servidor.ts` | Carga horária: soma as horas alocadas por UC + turma e avisa quando passa da carga |
| `lib/conflitos.ts` | Procura conflitos de horário do professor ou da turma |
| `lib/auth.ts` | Usuário logado e checagem de perfil (`exigirUsuario`, `exigirAdmin`) |
| `lib/sessao.ts` | Cookie de sessão criptografado (iron-session) |
| `proxy.ts` | Redireciona para o login quem não tem sessão |
| `scripts/criar-usuario.ts` | Cria ou atualiza usuários pelo terminal |

## Fuso horário

Os horários são tratados no fuso de Brasília (UTC-03:00).
