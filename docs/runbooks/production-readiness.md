# Preparacao Para Producao

Status: inicial, nao aprovado para producao real.

## O Que Ja Existe

- API NestJS compilada com endpoints operacionais em `/api/v1`.
- Cadastro de produtos.
- Movimentacoes de estoque por historico.
- Finalizacao de venda idempotente.
- Pagamento manual por Pix, dinheiro ou cartao externo.
- Baixa de estoque, CMV, lancamento financeiro e auditoria.
- Dashboard financeiro com receita, CMV, margem, ticket medio, vendas e ranking.
- Admin web e PWA conectados a API.
- Schema Prisma e migrations para PostgreSQL.

## Modo Demo Local

Quando PostgreSQL nao esta disponivel, a API entra em modo demo em memoria para permitir uso local da interface. Esse modo:

- Nao persiste dados apos reiniciar a API.
- Nao substitui PostgreSQL em producao.
- Existe apenas para desenvolvimento quando Docker/PostgreSQL nao estao disponiveis.

Em producao, configure PostgreSQL, execute migrations e desative qualquer dependencia operacional do modo demo.

## Antes de Produzir

1. Disponibilizar PostgreSQL gerenciado ou containerizado.
2. Definir `DATABASE_URL` real e segredos fora do repositorio.
3. Executar `corepack pnpm db:generate`.
4. Executar migrations em ambiente controlado.
5. Criar autenticação real, sessao, RBAC e resolucao segura de tenant/filial.
6. Substituir escopo demo por tenant/filial da sessao autenticada.
7. Implementar testes de integracao com PostgreSQL real.
8. Validar RLS, backups e restauracao.
9. Configurar HTTPS, rate limit e logs sem dados sensiveis.
10. Executar `corepack pnpm validate`.

## Bloqueios Atuais

- Docker nao esta disponivel no PATH deste ambiente, entao migrations nao foram aplicadas em PostgreSQL local nesta etapa.
- Autenticacao/RBAC ainda nao esta completa.
- Fallback demo em memoria nao e adequado para producao.
- Testes E2E com banco real ainda precisam ser adicionados.
