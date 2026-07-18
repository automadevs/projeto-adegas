# AdegaOS Product Assets

Este diretorio e o banco local versionado de imagens de produtos do AdegaOS.

## Estado Atual

- `product-images.json` possui 10 imagens reais verificadas para os produtos pre-cadastrados do demo.
- O placeholder interno continua no manifesto somente como guarda tecnica contra erro de arquivo, nao como imagem de produto demo.
- As categorias com imagens reais sao `beers`, `energy-drinks`, `soft-drinks`, `spirits` e `water`.
- Cada produto real possui PNG principal 512x512 e derivados 64, 128, 256 e 512 px.
- As copias publicas foram sincronizadas em:
  - `apps/admin-web/public/products`
  - `apps/attendant-pwa/public/products`
- O runtime nao depende de hotlink remoto; as URLs externas ficam apenas como metadados de origem.

## Produtos Cobertos

| SKU | Image key | Origem |
| --- | --- | --- |
| `SKOL350` | `skol-pilsen-can-350ml` | Chopp Brahma Express |
| `BRA350` | `brahma-can-350ml` | Chopp Brahma Express |
| `ANT350` | `antarctica-subzero-can-350ml` | Chopp Brahma Express |
| `HEINEKEN330` | `heineken-long-neck-330ml` | Supernosso |
| `COCA2L` | `coca-cola-original-bottle-2l` | Coca-Cola Andina |
| `REDBULL250` | `red-bull-energy-drink-can-250ml` | Chopp Brahma Express |
| `TNT269` | `tnt-energy-drink-can-269ml` | Supernosso |
| `CRYSTAL500` | `crystal-water-bottle-500ml` | Coca-Cola Andina |
| `SMIRNOFF998` | `smirnoff-vodka-bottle-998ml` | The Bar / Diageo |
| `JWRED1L` | `johnnie-walker-red-label-bottle-1l` | The Bar / Diageo |

## Regras Obrigatorias

- Google Imagens pode ser usado apenas para descoberta.
- Nao salvar thumbnails do Google nem URLs remotas como dependencia do catalogo.
- Nao armazenar PNG no PostgreSQL.
- Manter metadados no manifesto `product-images.json`.
- Registrar pagina original, dominio, tipo de fonte, hash SHA-256, dimensoes, tamanho e nota de uso.
- Nao associar imagem se marca, volume, sabor ou embalagem divergirem.
- Produtos demo nao devem usar placeholder generico.
- Produto sem imagem validada deve retornar `primaryImage: null`; a UI nao deve trocar por PNG generico como imagem normal.
- Falha de carregamento nao pode bloquear busca, carrinho, venda ou estoque.
- Imagem ja usada em historico deve ser arquivada/substituida, nao apagada sem trilha.

## Observacoes De Fonte

- Heineken: o asset direto do fabricante expirou/retornou 404 durante a validacao; foi usada uma fonte exata de retailer com imagem 1000x1000.
- Red Bull: o fabricante bloqueou download direto com 403; foi usada uma fonte exata de fornecedor com imagem 800x800.
- TNT: o site oficial disponibilizou asset frontal 125x272; foi usada fonte exata de retailer com 430x1000 para melhor qualidade visual.
- Todas essas decisoes estao registradas em `verification_note` no manifesto.

## QA Tecnico Executado

- Arquivo existe no pacote de assets.
- Copia publica existe nos dois apps.
- SHA-256 do manifesto bate com o arquivo em disco.
- Dimensoes do manifesto batem com PNG real.
- Todas as imagens e derivados sao quadrados.
- Nenhuma chave duplicada no manifesto.
- Nenhum arquivo duplicado no manifesto.
- 10 produtos demo possuem imagem `verified`.
- 0 produtos demo apontam para `product-placeholder`.

## Checklist Para Novas Imagens

- Confirmar produto, marca, variante, volume e embalagem.
- Abrir a pagina original antes de baixar.
- Preferir fabricante, loja oficial da marca, fornecedor ou distribuidor autorizado.
- Baixar a maior resolucao disponivel que corresponda exatamente ao produto.
- Padronizar para 1:1, centralizado, com padding interno entre 6% e 12%.
- Usar fundo transparente quando possivel.
- Gerar PNG principal e derivados 64, 128, 256 e 512 px.
- Calcular SHA-256 depois da otimizacao.
- Atualizar `product-images.json`.
- Sincronizar para os diretorios `public/products` dos dois apps.
- Validar visualmente no Order e no Manager antes de liberar.
