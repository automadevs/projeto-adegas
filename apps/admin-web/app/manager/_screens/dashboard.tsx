import { getMarginPercent, formatMoney, formatPercent, toChartSeries } from "../_lib/format";
import type { Dashboard, NavId, Product } from "../_lib/types";
import { LineChart, MarginChart } from "../_components/charts";
import { LowStockTable, RecentSalesTable, TopProductsList } from "../_components/tables";
import { PeriodSel, SectionCard, StatCard } from "../_components/ui";

export function DashboardScreen({
  dashboard,
  lowStock,
  onSelectNav,
  recentSales,
  topProducts
}: {
  readonly dashboard: Dashboard;
  readonly lowStock: readonly Product[];
  readonly onSelectNav: (nav: NavId) => void;
  readonly recentSales: readonly Dashboard["recentSales"][number][];
  readonly topProducts: readonly Dashboard["topProducts"][number][];
}) {
  const chartSeries = toChartSeries(dashboard);
  const marginPercent = getMarginPercent(dashboard);

  return (
    <>
      <div className="source-stat-grid source-stat-grid-five">
        <StatCard delta="12,4%" icon="money" label="Receita" tone="success" value={formatMoney(dashboard.revenueCents)} hint="Ontem: R$ 16.678,20" />
        <StatCard delta="8,7%" icon="box" label="CMV" tone="destructive" value={formatMoney(dashboard.cogsCents)} hint="Ontem: R$ 7.785,10" />
        <StatCard delta="14,1%" icon="percent" label="Margem" tone="info" value={formatPercent(marginPercent)} hint="Ontem: 53,4%" />
        <StatCard icon="cash" label="Caixa" tone="primary" value="R$ 1.248,50" hint="Em aberto" />
        <StatCard icon="alert" label="Estoque baixo" tone="warning" value={String(dashboard.lowStockCount || lowStock.length)} hint="Produtos" />
      </div>

      <div className="source-grid source-grid-two">
        <SectionCard action={<PeriodSel />} title="Receita x CMV (R$)">
          <LineChart cogs={chartSeries.map((point) => point.cogs)} labels={chartSeries.map((point) => point.label)} revenue={chartSeries.map((point) => point.revenue)} />
        </SectionCard>
        <SectionCard action={<PeriodSel />} title="Margem (%)">
          <MarginChart labels={chartSeries.map((point) => point.label)} values={chartSeries.map((point) => point.margin)} />
        </SectionCard>
      </div>

      <div className="source-grid source-grid-three">
        <SectionCard action={<button className="source-link" onClick={() => onSelectNav("estoque")} type="button">Ver todos</button>} title="Alertas de estoque baixo">
          <LowStockTable lowStock={lowStock} onOpenStock={() => onSelectNav("estoque")} />
        </SectionCard>
        <SectionCard action={<button className="source-link" onClick={() => onSelectNav("produtos")} type="button">Ver catalogo</button>} title="Mais vendidos (mes)">
          <TopProductsList topProducts={topProducts} />
        </SectionCard>
        <SectionCard action={<button className="source-link" onClick={() => onSelectNav("vendas")} type="button">Ver todas</button>} title="Vendas recentes">
          <RecentSalesTable recentSales={recentSales} />
        </SectionCard>
      </div>
    </>
  );
}
