# Visao do Produto

AdegaOS e um SaaS operacional e financeiro para estabelecimentos com venda rapida, estoque sensivel e atendimento em multiplos canais. O publico inicial inclui adegas, bares, distribuidoras de bebidas, tabacarias, conveniencias e pequenos depositos.

## Objetivo

Controlar operacao, faturamento, CMV, margem, custos, contas a pagar, contas a receber, fluxo de caixa, estoque, pedidos e atendimento movel sem atuar como gateway de pagamento.

## Personas Principais

- Proprietario: acompanha resultado, margem, caixa, estoque e riscos.
- Administrador: configura empresa, filial, usuarios, permissoes, produtos e precos.
- Gerente: acompanha operacao, autoriza excecoes e resolve divergencias.
- Financeiro: registra contas, conciliacoes, recebimentos, pagamentos e fechamento.
- Estoque/compras: controla entradas, perdas, inventarios, fornecedores e custo medio.
- Caixa/atendente/garcom: registra pedidos, pagamentos manuais e operacoes rapidas.

## Primeiro Resultado Esperado

O primeiro incremento vertical deve provar a cadeia critica:

```text
autenticacao -> tenant/filial -> produto/preco/estoque -> pedido
-> finalizacao -> pagamento manual -> estoque/CMV -> financeiro -> auditoria
```

Uma venda reenviada com a mesma chave de idempotencia nao pode duplicar efeitos.

## Fora do Escopo Inicial

- Gateway de pagamento.
- Integracoes fiscais.
- IA.
- Dashboards decorativos.
- Microsservicos, Kubernetes ou Kafka.
- Delivery integrado a marketplaces.
- Fechamento financeiro definitivo offline.
