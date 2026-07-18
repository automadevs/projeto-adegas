# ADR 0001: Monolito Modular em Monorepo

Status: Aceito inicial

Data: 2026-06-25

## Contexto

AdegaOS precisa cobrir dominios com forte consistencia: pedidos, estoque, pagamentos, CMV, financeiro, auditoria e multiempresa. No MVP, a especificacao proibe complexidade desproporcional como microsservicos, Kubernetes e Kafka.

O repositorio iniciou vazio, entao a primeira decisao arquitetural deve criar uma base simples, verificavel e preparada para crescer.

## Decisao

Usar monolito modular em monorepo TypeScript com:

- `pnpm` workspaces para dependencias locais.
- Turborepo para orquestrar build, lint, typecheck e testes.
- `apps/api` como API NestJS modular.
- `apps/admin-web` como painel Next.js.
- `apps/attendant-pwa` como PWA Next.js mobile-first.
- `apps/worker` para jobs e outbox quando houver necessidade real.
- `packages/domain` livre de infraestrutura.
- `packages/database` centralizando Prisma, schema, migrations e seeds.
- Packages compartilhados para API client, UI, auth, observabilidade, testes e config.

## Alternativas Consideradas

- Microsservicos desde o inicio: rejeitado por elevar custo operacional, observabilidade, deploy e consistencia distribuida antes do produto validar o fluxo central.
- Repositorios separados: rejeitado por dificultar refactors coordenados e contratos internos no MVP.
- Aplicacao unica sem packages: rejeitado por misturar dominios e atrasar a separacao entre API, PWA, painel e regras puras.

## Consequencias

- A consistencia transacional da venda fica mais simples no MVP.
- Modulos podem evoluir com fronteiras claras sem custo de rede entre servicos.
- O monorepo exige disciplina de dependencia: packages nao importam apps, e `domain` nao importa infraestrutura.
- Migrar um modulo para servico separado no futuro deve exigir ADR especifico, motivado por escala, equipe ou isolamento operacional real.
