# Backlog Priorizado

## Incremento 1: Venda Minima Integrada

| ID | Titulo | Objetivo | Status |
| --- | --- | --- | --- |
| ADEGA-001 | Scaffold do monorepo | Criar workspaces, apps, packages, scripts e documentacao inicial. | In Progress |
| ADEGA-002 | API base | Expor `/api/v1/health`, correlation id e Problem Details. | Ready |
| ADEGA-003 | Banco inicial | Definir Prisma schema, migrations, tenant/branch e entidades do fluxo. | Ready |
| ADEGA-004 | Dominio base | Criar tipos seguros para dinheiro, IDs, escopo e idempotencia. | Ready |
| ADEGA-005 | Modelo de venda | Modelar pedido, item, pagamento, estoque, CMV, financeiro e auditoria. | Backlog |
| ADEGA-006 | Idempotencia | Persistir chave por tenant/filial/operacao e impedir duplicidade concorrente. | Backlog |
| ADEGA-007 | Finalizar venda | Criar endpoint transacional de finalizacao da venda minima. | Backlog |
| ADEGA-008 | Estoque por movimento | Registrar entrada inicial, reserva, baixa e liberacao por movimentos. | Backlog |
| ADEGA-009 | Financeiro minimo | Gerar lancamento de receita/recebivel conforme forma de pagamento. | Backlog |
| ADEGA-010 | CMV minimo | Calcular CMV por custo medio ponderado e vincular a venda. | Backlog |
| ADEGA-011 | Auditoria append-only | Auditar venda, pagamento, estoque, financeiro e falhas relevantes. | Backlog |
| ADEGA-012 | OpenAPI 3.1 | Documentar contratos, headers, Problem Details e exemplos. | Backlog |
| ADEGA-013 | Testes unitarios | Cobrir dinheiro, totais, estados, estoque, CMV e permissoes. | Backlog |
| ADEGA-014 | Testes de integracao | Validar banco real, transacao, rollback, idempotencia e isolamento tenant. | Backlog |
| ADEGA-015 | E2E vertical | Validar venda completa e retry idempotente ponta a ponta. | Backlog |
| ADEGA-016 | Worker minimo | Preparar consumo de outbox/jobs sem mover consistencia critica para fila. | Backlog |
| ADEGA-017 | UI operacional minima | Criar fluxo simples apos estabilizar contrato da API. | Backlog |

## Criterios de Aceite do Incremento

- A venda cria pedido, pagamento, baixa de estoque, CMV, financeiro e auditoria em uma transacao consistente.
- Reenvio com a mesma chave de idempotencia nao duplica efeitos.
- Estoque e alterado apenas por movimentacoes.
- Nenhuma regra financeira critica usa ponto flutuante.
- Todo dado empresarial possui `tenant_id` e, quando aplicavel, `branch_id`.
- API usa `/api/v1`, Problem Details, Correlation ID e `Idempotency-Key` nos comandos criticos.
- Testes cobrem sucesso, retry, estoque insuficiente, falha transacional e acesso cruzado entre tenants.

## Riscos Principais

- Vazamento entre tenants se o escopo vier do payload.
- Duplicidade de estoque/financeiro se idempotencia nao for transacional.
- Saldos incorretos se movimentacoes e saldos materializados divergirem.
- CMV errado se custo medio e quantidade nao forem tratados com precisao.
- Auditoria insuficiente em ajustes, cancelamentos e excecoes.
