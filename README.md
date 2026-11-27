# Agenda de Professores

Calendário de alocação dos professores, no estilo de visualização do Outlook.

Stack: Next.js 16, React 19, TypeScript, Tailwind 4, FullCalendar 7 e Prisma 7 (SQLite em desenvolvimento).

## Como rodar

Requer **Node.js 22 ou mais novo** (o Prisma e o SQLite não funcionam no Node 20). Com o nvm: `nvm install 22` e `nvm use 22`.

```bash
npm install                      # instala as dependências e gera o cliente do Prisma
copy .env.example .env           # no Windows (no Linux/macOS: cp .env.example .env)
npm run db:migrate               # cria o banco local dev.db
npm run db:seed                  # opcional: dados de exemplo
npm run dev
```

Abra http://localhost:3000. No `.env`, troque o `SESSION_PASSWORD` por uma chave aleatória (o comando para gerar está no `.env.example`).

## Login e perfis

| Perfil | Pode |
| --- | --- |
| Admin | Ver e editar tudo |
| Professor | Só visualizar (a própria agenda e a dos outros professores) |

O seed cria dois usuários de exemplo, só para desenvolvimento: `admin@exemplo.com` / `admin12345` (Admin) e `ana@exemplo.com` / `professor123` (Professor).

O Admin libera o acesso de um professor na tela **Professores**: basta informar o e-mail e uma senha inicial ao cadastrar (ou na edição do professor). Na edição também dá para trocar a senha e bloquear o acesso sem apagar o professor. O professor entra com esse e-mail e senha e só visualiza o calendário, com o atalho "Minha agenda".

Para criar ou atualizar um usuário pelo terminal (por exemplo, o primeiro Admin):

```bash
npm run usuario:criar -- --nome "Fulano" --email fulano@escola.com --senha "senhaForte123" --papel ADMIN
npm run usuario:criar -- --nome "Ana" --email ana@escola.com --senha "senhaForte123" --papel PROFESSOR --professor 1
```

`--professor` é o id do cadastro do professor (opcional).

## Estrutura

| Caminho | O que tem |
| --- | --- |
| `prisma/schema.prisma` | Modelo de dados: Professor, Curso (com Modalidade), UC, Turma, SerieAlocacao (lote) e Alocacao (cada bloco do calendário) |
| `prisma/seed.ts` | Dados de exemplo |
| `lib/recorrencia.ts` | Validação e geração das ocorrências de uma alocação em lote |
| `lib/prisma.ts` | Conexão com o banco |
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
