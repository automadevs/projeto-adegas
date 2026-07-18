# AdegaOS Spec v3 Gap Analysis

Fonte principal: `C:\Users\Teser\Downloads\AdegaOS_especificacao_completa_v3.json`.

Complemento de assets: `C:\Users\Teser\Downloads\AdegaOS_banco_imagens_produtos.json`.

## Estado preservado

- Monorepo TypeScript com `apps/api`, `apps/admin-web`, `apps/attendant-pwa` e `packages/*`.
- API NestJS em `/api/v1` com Problem Details, correlation id e Swagger inicial.
- Banco inicial com tenant, filial, usuario, produto, pedido, item, pagamento, movimento de estoque, financeiro, auditoria e idempotencia.
- Venda minima parcial ja conectada: produto, estoque por movimento, finalizacao idempotente, pagamento manual, baixa de estoque, CMV basico, financeiro e auditoria.
- Admin e PWA consomem a API existente para produtos e venda rapida.
- Design Manager segue a referencia visual compacta ja documentada em `docs/design/adegaos-reference-topology.md`.

## Lacunas funcionais

- Autenticacao real ausente: `/auth/login`, refresh, logout, sessao, Argon2id e resolucao segura de tenant/filial.
- RBAC ausente: `Role`, `Permission`, `UserBranch`, guards e permissoes por caso de uso.
- AdegaOS Order ainda nao esta separado em rotas/produto autonomo: faltam login, home operacional, mesas, comandas, editor de pedido, preparo, pagamento manual completo e sync offline.
- AdegaOS Manager ainda e uma tela unica: faltam rotas `/manager/*` por responsabilidade.
- Dashboard atual contem formulario de produto; a v3 exige dashboard somente leitura.
- Produtos ainda sao obrigatoriamente `branch_id`; a v3 exige catalogo do tenant reutilizado por Order e Manager.
- API usa `/items` e `/financial/dashboard`; a v3 usa `/products` e `/finance/overview`.
- Estoque nao separa fisico, reservado e disponivel, nem localizacao, embalagem, transferencia, inventario ou saldo materializado.
- Banco possui 11 modelos contra 44 entidades da v3.
- Banco de imagens inexistia; a primeira fase cria apenas placeholder, manifesto e contrato nullable.
- Testes de integracao/e2e ainda ausentes.

## Conflitos e decisoes

| Conflito | Decisao | Justificativa | Arquivos afetados |
| --- | --- | --- | --- |
| Dashboard atual tem cadastro de produto. | Nao apagar agora; mover para Produtos em fase propria. | Preserva fluxo funcional enquanto cria rotas Manager reais. | `apps/admin-web/app/page.tsx` |
| Spec usa `/products`; app usa `/items`. | Criar aliases conectados a `OperationsService`, mantendo `/items`. | Evita quebra dos frontends e inicia compatibilidade v3. | `apps/api/src/modules/operations/products.controller.ts` |
| Spec usa `/finance`; app usa `/financial`. | Criar `/finance/overview` conectado ao dashboard atual. | Compatibilidade sem duplicar regra financeira no frontend. | `apps/api/src/modules/operations/finance.controller.ts` |
| Tenant deve vir da sessao; API aceita headers demo. | Registrar como bloqueio de producao; manter fallback apenas ate auth real. | Remover headers agora quebraria o MVP sem sessao pronta. | `apps/api/src/modules/operations/scope.ts` |
| Order MVP nao inclui scanner. | Remover/desativar no Order real em fase UI; preview visual ainda sera tratado separadamente. | A v3 prioriza venda/comanda sem scanner inicial. | `apps/attendant-pwa/app/page.tsx` |
| Imagens reais exigem origem validada. | Nao baixar imagens de marca nesta fase; usar placeholder gerado internamente. | Evita risco legal e cadastro de variante incorreta. | `packages/assets/products` |

## Fases de implementacao

1. Fundacao v3 segura: aliases reais, manifesto de imagens, placeholder, contrato de imagem nullable, documentacao de lacunas e mapa central de icones.
2. Order MVP 0: auth inicial, tenant/filial por sessao, catalogo basico, categorias e setores, sem scanner.
3. Catalogo tenant-aware: manter IDs entre Order e Manager, enriquecer produto sem duplicar.
4. Order MVP 1: mesas, comandas, editor de pedido e preparo por setor.
5. Order MVP 2: pagamento manual completo, vendas recentes, offline e sync.
6. Manager Core: rotas e paginas responsaveis para dashboard, produtos, estoque, vendas e financeiro.
7. Assets reais: localizar origem oficial, baixar, padronizar 1:1, gerar 64/128/256/512, SHA-256, manifestar e associar por `image_key`.
