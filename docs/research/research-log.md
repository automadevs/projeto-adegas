# Research Log

Data de acesso: 2026-06-25.

## Fontes Tecnicas

| Fonte | URL | Fato observado | Recomendacao para AdegaOS |
| --- | --- | --- | --- |
| pnpm Workspaces | https://pnpm.io/workspaces | Workspaces usam `pnpm-workspace.yaml` na raiz para agrupar projetos em um monorepo. | Usar `apps/*` e `packages/*` como workspaces. |
| Turborepo Docs | https://turborepo.dev/docs | Turborepo coordena tarefas de build, lint e teste em monorepos com cache. | Usar `turbo.json` para `build`, `typecheck`, `lint`, `test` e `dev`. |
| NestJS OpenAPI | https://docs.nestjs.com/openapi/introduction | Nest oferece modulo dedicado para gerar documentacao OpenAPI a partir da API. | Preparar `apps/api` para Swagger/OpenAPI e evoluir para contrato 3.1. |
| Prisma Client Generation | https://www.prisma.io/docs/orm/prisma-client/setup-and-configuration/generating-prisma-client | Prisma 7 exige `output` explicito para o client novo e adaptador de driver para conexao. | Centralizar schema/config em `packages/database` e nao acoplar a API ao client gerado antes da persistencia real. |
| Next.js App Router | https://nextjs.org/docs/app | App Router usa roteamento por arquivos e recursos modernos do React. | Usar App Router nos dois frontends para separar admin e PWA. |
| Dexie Docs | https://dexie.org/docs | Dexie e wrapper para IndexedDB voltado a apps offline-first. | Usar Dexie quando a fila offline da PWA for implementada. |
| BullMQ Docs | https://docs.bullmq.io/ | BullMQ e uma fila para Node.js baseada em Redis. | Manter Redis/BullMQ para jobs reais e outbox, sem tirar consistencia critica da transacao da venda. |
| TanStack Query | https://tanstack.com/query/latest/docs/framework/react/overview | TanStack Query gerencia server state em apps React. | Usar nos frontends quando houver consumo real de API. |
| PostgreSQL RLS | https://www.postgresql.org/docs/current/ddl-rowsecurity.html | Row Level Security restringe linhas retornadas ou modificadas por usuario/politica. | Planejar RLS como defesa em profundidade para tabelas tenant-aware. |
| OWASP API Security Top 10 2023 | https://owasp.org/API-Security/editions/2023/en/0x11-t10/ | Broken Object Level Authorization e risco central para APIs com identificadores de objeto. | Autorizar por caso de uso e escopo tenant/branch em toda consulta por ID. |

## Fontes de UX e Produto

| Fonte | URL | Fato observado | Para AdegaOS |
| --- | --- | --- | --- |
| WCAG 2.2 Target Size Minimum | https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html | Alvos pequenos ou proximos aumentam acionamentos acidentais. | Usar no minimo 44x44 CSS px nos fluxos de atendimento, conforme especificacao do produto. |
| Material Design 3 Buttons | https://m3.material.io/components/buttons/overview | Buttons possuem variacoes de estado, enfase e comportamento selecionavel. | Criar componentes operacionais com estados claros e foco visivel. |
| Odoo Restaurant Features | https://www.odoo.com/documentation/19.0/applications/sales/point_of_sale/restaurant.html | POS de restaurante organiza mesas, pedidos, cozinha/bar, contas e divisao. | Modelar mesas/comandas depois da venda minima, sem copiar identidade visual. |
| Square Split Payments | https://squareup.com/help/us/en/article/5097-process-split-tender-payments-with-square | Sistemas POS aceitam divisao de pagamento por multiplas formas. | Incluir pagamento misto no backlog de caixa/financeiro, apos o fluxo manual simples. |
| ANPD Guia de Seguranca | https://www.gov.br/anpd/pt-br/assuntos/noticias/anpd-publica-guia-de-seguranca-para-agentes-de-tratamento-de-pequeno-porte | ANPD recomenda medidas administrativas e tecnicas de seguranca para agentes de tratamento. | Adotar LGPD desde a concepcao: minimo necessario, mascaramento de logs, backups e controle de acesso. |

## Decisoes Derivadas

- Monorepo com pnpm e Turborepo e adequado para manter apps e packages alinhados sem microsservicos no MVP.
- Prisma 7 sera tratado com `prisma.config.ts`, generator com `output` explicito e adaptador PostgreSQL quando a camada de persistencia for implementada.
- PWA offline deve vir depois do contrato transacional da venda, pois fechamento financeiro definitivo offline e proibido.
- UX do atendente deve privilegiar densidade, alvos de toque seguros, pouco texto e feedback de sincronizacao.
