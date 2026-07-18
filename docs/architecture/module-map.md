# Mapa de Modulos

## Modulos de Dominio

| Modulo | Responsabilidade | Primeiro incremento |
| --- | --- | --- |
| identity_and_access | Usuarios, sessoes, papeis, permissoes e escopo autenticado. | Sim |
| tenancy | Tenant, filial e isolamento multiempresa. | Sim |
| catalog | Produtos, categorias, marcas, unidades e codigos de barras. | Sim |
| pricing | Listas de preco, historico e regras de desconto. | Parcial |
| inventory | Saldos, reservas, movimentos, custo medio e inventario. | Sim |
| orders | Pedido, itens, status e finalizacao. | Sim |
| cash_management | Sessao de caixa, movimentacoes e diferencas. | Parcial |
| finance | Contas, recebiveis, lancamentos, categorias e DRE/caixa. | Sim |
| audit | Auditoria append-only de operacoes sensiveis. | Sim |
| tables_and_tabs | Mesas, comandas, transferencias e divisao. | Depois |
| purchasing | Compras, fornecedores e recebimento. | Depois |
| recipes | Fichas tecnicas, drinks e combos. | Depois |
| customers | Clientes, enderecos e CRM. | Depois |
| delivery | Entregas e zonas. | Depois |
| analytics | Relatorios e indicadores consolidados. | Depois |

## Organizacao Backend Esperada

```text
modules/<modulo>/
  domain/
  application/
  infrastructure/
  presentation/
  <modulo>.module.ts
```

## Regras de Dependencia

- `domain` nao importa NestJS, Prisma, Redis ou HTTP.
- `application` coordena casos de uso, permissoes e transacoes.
- `infrastructure` implementa portas de persistencia, filas e integracoes.
- `presentation` expõe controllers, DTOs, validacao de entrada e serializacao.
- Frontends consomem API e packages compartilhados; nao importam codigo de `apps/api`.

## Eventos Iniciais

- `order.created`
- `order.confirmed`
- `order.cancelled`
- `order.completed`
- `stock.reserved`
- `stock.consumed`
- `stock.released`
- `payment.recorded`
- `financial.entry.created`
