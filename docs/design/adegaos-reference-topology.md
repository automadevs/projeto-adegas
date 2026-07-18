# AdegaOS Reference Topology

Fonte: `C:\Users\Teser\AppData\Local\Temp\codex-clipboard-4548c803-ab61-4ed6-a59a-77afb7594903.png`.

Imagem analisada por amostragem de pixels com `System.Drawing`, validada com captura do navegador em `1066x708`.

## Medidas-alvo

- Canvas: `1066 x 708`, proporcao `1.5056`.
- Sidebar: `x=0`, `y=0`, `w=136`, `h=708`.
- Topbar central: `x=136`, `y=0`, `w=765`, `h=48`.
- Area central: `x=136`, `y=48`, `w=765`, `h=660`.
- Rail PWA: `x=901`, `y=0`, `w=167`, `h=708`.
- KPIs: `x=145`, `y=58`, `w=739`, `h=78`, `gap=8`.
- Graficos: `x=145`, `y=148`, `w=739`, `h=198`, `gap=10`.
- Linha inferior: `x=145`, `y=357`, `w=739`, `h=318`, `gap=8-10`.
- Phone shell: `x=907`, `y=35`, `w=153`, `h=632`, raio `22`.

## Cores-base

- Sidebar: `#011833`, com ativo `#0b6ee4`.
- Fundo central: `#f7f9fc` a `#fefefe`.
- Bordas: `#e1e6ef` / `#e4e8ef`.
- Azul primario: `#006ee6`; cabecalho PWA: `#0044a6`.
- Verde sucesso/caixa: `#16a34a` / `#00a651`.
- Vermelho alerta: `#ef4444`.
- Laranja estoque baixo: `#f97316`.
- Texto forte: `#111827`; texto secundario: `#6b7280`.

## Regras visuais aplicadas

- Layout em tres zonas: menu fixo, dashboard compacto e preview PWA independente no lado direito.
- Tipografia pequena, densa e funcional; sem hero, sem cards decorativos aninhados.
- Cards com raio maximo `6px` no desktop e bordas de `1px`.
- PWA deve priorizar venda rapida: busca sempre visivel, scanner visual, adicionar rapido, carrinho e finalizar venda.
- Complemento operacional: manter sinais de caixa, venda, estoque e pagamento manual/PIX/cartao como preparacao visual, sem mover calculos financeiros para o frontend.
