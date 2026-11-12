# Agenda de Professores

Calendário de alocação dos professores, no estilo de visualização do Outlook.

Stack: Next.js 16, React 19, TypeScript, Tailwind 4, FullCalendar 7 e Prisma 7 (SQLite em desenvolvimento).

## Como rodar

```bash
npm install                      # instala as dependências e gera o cliente do Prisma
copy .env.example .env           # no Windows (no Linux/macOS: cp .env.example .env)
npm run db:migrate               # cria o banco local dev.db
npm run db:seed                  # opcional: dados de exemplo
npm run dev
```

Abra http://localhost:3000.

## Estrutura

| Caminho | O que tem |
| --- | --- |
| `prisma/schema.prisma` | Modelo de dados: Professor, Curso (com Modalidade), UC, Turma, SerieAlocacao (lote) e Alocacao (cada bloco do calendário) |
| `prisma/seed.ts` | Dados de exemplo |
| `lib/recorrencia.ts` | Validação e geração das ocorrências de uma alocação em lote |
| `lib/prisma.ts` | Conexão com o banco |
| `app/api/alocacoes/route.ts` | `GET /api/alocacoes?inicio=&fim=&professores=1,2` |
| `app/ui/calendario.tsx` | Calendário semanal com filtros por professor e período |

## Fuso horário

Os horários são tratados no fuso de Brasília (UTC-03:00).
