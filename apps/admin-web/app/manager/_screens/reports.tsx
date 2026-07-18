import { useMemo } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";

import { chartColor, formatMoney, paymentLabel } from "../_lib/format";
import type { Dashboard, Product, ReportExport } from "../_lib/types";
import { ReportTable } from "../_components/tables";
import { PageHeader, SectionCard } from "../_components/ui";

export function ReportsScreen({
  dashboard,
  onCreateReport,
  products,
  reportExports
}: {
  readonly dashboard: Dashboard;
  readonly onCreateReport: (format: ReportExport["format"]) => Promise<void>;
  readonly products: readonly Product[];
  readonly reportExports: readonly ReportExport[];
}) {
  const byPayment = useMemo(() => {
    const map = new Map<string, number>();
    dashboard.recentSales.forEach((sale) => map.set(paymentLabel(sale.paymentMethod), (map.get(paymentLabel(sale.paymentMethod)) ?? 0) + Number(sale.totalCents)));
    return Array.from(map.entries()).map(([name, value]) => ({ name, value }));
  }, [dashboard.recentSales]);
  const byCategory = useMemo(() => {
    const map = new Map<string, number>();
    products.forEach((product) => map.set(product.category, (map.get(product.category) ?? 0) + Number(product.salePriceCents)));
    return Array.from(map.entries()).map(([name, value]) => ({ name, value })).slice(0, 8);
  }, [products]);
  const top = dashboard.topProducts.slice(0, 10);

  return (
    <>
      <PageHeader actions={
        <div className="source-actions-row">
          <button className="source-ghost" onClick={() => void onCreateReport("pdf")} type="button">PDF</button>
          <button className="source-ghost" onClick={() => void onCreateReport("xlsx")} type="button">XLSX</button>
          <button className="source-primary" onClick={() => void onCreateReport("csv")} type="button">CSV</button>
        </div>
      } subtitle="Analises consolidadas do periodo" title="Relatorios" />
      <div className="source-grid source-grid-two">
        <SectionCard title="Vendas por forma de pagamento">
          <div className="chart-shell">
            {byPayment.length === 0 ? <p className="source-muted">Sem vendas no periodo.</p> : (
              <ResponsiveContainer height="100%" width="100%">
                <PieChart>
                  <Pie data={byPayment} dataKey="value" innerRadius={48} nameKey="name" outerRadius={86} paddingAngle={2}>
                    {byPayment.map((item, index) => <Cell fill={chartColor(index)} key={item.name} />)}
                  </Pie>
                  <Tooltip formatter={(value) => formatMoney(Number(value))} />
                  <Legend iconSize={8} wrapperStyle={{ color: "#334155", fontSize: 12, fontWeight: 650 }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </SectionCard>
        <SectionCard title="Vendas por categoria">
          <div className="chart-shell">
            {byCategory.length === 0 ? <p className="source-muted">Sem produtos cadastrados.</p> : (
              <ResponsiveContainer height="100%" width="100%">
                <BarChart data={byCategory} margin={{ bottom: 4, left: -14, right: 8, top: 8 }}>
                  <CartesianGrid stroke="#e5e7eb" strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" tick={{ fill: "#64748b", fontSize: 11 }} tickLine={false} />
                  <YAxis tick={{ fill: "#64748b", fontSize: 11 }} tickFormatter={(value) => `R$${Math.round(Number(value) / 100)}`} tickLine={false} />
                  <Tooltip formatter={(value) => formatMoney(Number(value))} />
                  <Bar dataKey="value" fill="#0077d9" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </SectionCard>
      </div>
      <SectionCard title="Top 10 produtos">
        <table className="source-table">
          <thead><tr><th>#</th><th>Produto</th><th>Qtde vendida</th><th>Faturamento</th></tr></thead>
          <tbody>
            {top.map((item, index) => <tr key={`${item.name}-${index}`}><td className="source-primary-text">{index + 1}</td><td>{item.name}</td><td>{item.quantity}</td><td>{formatMoney(item.revenueCents)}</td></tr>)}
            {top.length === 0 ? <tr><td className="source-empty" colSpan={4}>Nenhuma venda registrada.</td></tr> : null}
          </tbody>
        </table>
      </SectionCard>
      <SectionCard title="Historico de exportacoes">
        <ReportTable reports={reportExports} />
      </SectionCard>
    </>
  );
}
