# AdegaOS SaaS

AdegaOS e um SaaS multiempresa para adegas, bares, distribuidoras, tabacarias, conveniencias e operacoes com balcao, mesas, comandas e delivery proprio. O produto sera construido de forma incremental, com foco inicial na venda minima integrada: pedido, pagamento manual, baixa de estoque, CMV, lancamento financeiro e auditoria em uma operacao idempotente.

## Estado Atual

- Repositorio iniciado em branco, sem commits anteriores.
- Fundacao criada como monorepo TypeScript com pnpm workspaces e Turborepo.
- Documentacao inicial de produto, arquitetura, pesquisa, ADR e backlog criada em `docs/`.
- Apps e packages foram scaffoldados com contratos minimos para evolucao do primeiro incremento vertical.
- A integracao completa da venda ainda nao esta implementada; ela esta priorizada no backlog.

## Stack Inicial

- TypeScript
- pnpm workspaces
- Turborepo
- NestJS para `apps/api`
- Next.js para `apps/admin-web` e `apps/attendant-pwa`
- Prisma e PostgreSQL em `packages/database`
- Vitest para testes unitarios iniciais
- Docker Compose para PostgreSQL e Redis locais

## Estrutura

```text
apps/
  api/
  admin-web/
  attendant-pwa/
  worker/
packages/
  api-client/
  auth/
  config/
  database/
  domain/
  observability/
  testing/
  ui/
docs/
  adr/
  architecture/
  product/
  research/
infra/
scripts/
tests/
```

## Requisitos Locais

- Node.js 22 ou superior
- Corepack habilitado para executar pnpm
- Docker e Docker Compose para banco e Redis locais

## Comandos

```bash
corepack pnpm install
corepack pnpm lint
corepack pnpm typecheck
corepack pnpm test
corepack pnpm build
```

Infra local:

```bash
corepack pnpm infra:up
corepack pnpm infra:down
```

Banco:

```bash
corepack pnpm db:validate
corepack pnpm db:generate
```

## Variaveis de Ambiente

Copie `.env.example` para `.env` quando for rodar a infra local.

```env
DATABASE_URL=postgresql://adegaos:adegaos@localhost:5432/adegaos?schema=public
REDIS_URL=redis://localhost:6379
JWT_ACCESS_SECRET=change-me-in-local-dev
JWT_REFRESH_SECRET=change-me-in-local-dev
```

## Primeiro Incremento Vertical

O primeiro incremento funcional sera `Venda minima integrada`. A condicao de sucesso e registrar uma venda uma unica vez e produzir corretamente pedido, pagamento, baixa de estoque, CMV, receita/recebivel e trilha de auditoria, mesmo em reenvios com a mesma chave de idempotencia.

Consulte `docs/product/backlog.md` para a sequencia priorizada.

## Fluxo Operacional Atual

Endpoints ja disponiveis:

- `GET /api/v1/items`
- `POST /api/v1/items`
- `GET /api/v1/inventory/balances`
- `POST /api/v1/inventory/movements`
- `POST /api/v1/sales/finalize`
- `GET /api/v1/financial/dashboard`
- `GET /api/v1/audit/events`

Se PostgreSQL nao estiver disponivel, a API usa dados demo em memoria para desenvolvimento local. Producao deve usar PostgreSQL com migrations aplicadas. Consulte `docs/runbooks/production-readiness.md`.
