# Regras de Negocio

## Dinheiro

- Valores monetarios criticos devem usar centavos inteiros ou decimal de precisao fixa.
- O dominio inicial usa centavos inteiros representados como `bigint`.
- Venda realizada, pagamento, recebimento, liquidacao, faturamento, receita liquida, CMV, margem e fluxo de caixa sao conceitos separados.
- DRE usa competencia; fluxo de caixa usa liquidacao.
- Estornos criam lancamentos compensatorios.

## Venda Minima Integrada

Toda finalizacao de venda deve ocorrer de forma consistente e idempotente:

1. Validar pedido e permissao.
2. Validar estoque e reservas.
3. Consolidar subtotais.
4. Aplicar descontos autorizados.
5. Registrar pagamento ou recebivel.
6. Registrar taxas previstas quando houver maquininha.
7. Baixar estoque por movimento.
8. Calcular CMV por custo medio ponderado no MVP.
9. Gerar lancamento financeiro.
10. Registrar auditoria.
11. Publicar eventos por outbox quando necessario.

## Estoque

- Estoque e rastreado por movimentacoes.
- Pedido confirmado reserva estoque.
- Cancelamento libera reserva.
- Finalizacao consome a reserva.
- Ajustes exigem motivo, usuario e auditoria.
- Saldos podem ser materializados, mas nao substituem a trilha de movimentos.

## Multiempresa

- Dados empresariais carregam `tenant_id`.
- Dados vinculados a unidade carregam `branch_id`.
- O tenant e a filial sao resolvidos pela sessao autenticada.
- O cliente nao e fonte confiavel para `tenant_id`.
- Testes devem provar isolamento entre tenants.

## Atendimento Movel e Offline

- Operacao offline e limitada ao webapp do atendente.
- Comandos offline devem ter `client_command_id` e chave de idempotencia.
- A interface diferencia salvo localmente, aguardando envio, sincronizando, confirmado, falhou e em conflito.
- Fechamento financeiro definitivo, alteracao de preco e alteracao de permissao sao online-only.

## Produtos Restritos

- Bebidas alcoolicas, cigarros e produtos fumigenos devem ser marcados como restritos.
- A venda deve exibir alerta operacional e registrar confirmacao de verificacao quando aplicavel.
- Nao armazenar imagem de documento sem necessidade legal documentada.
