import { useState } from "react";

import { formatMoney, formatPercent, formatSaleDate, getMarginPercent, orderNumber, paymentLabel } from "../_lib/format";
import type { Dashboard } from "../_lib/types";
import { Badge, PageHeader, SectionCard, StatCard } from "../_components/ui";

export function SalesScreen({
  dashboard,
  onAction,
  recentSales
}: {
  readonly dashboard: Dashboard;
  readonly onAction: (message: string) => void;
  readonly recentSales: readonly Dashboard["recentSales"][number][];
}) {
  const [filter, setFilter] = useState<"todas" | "concluidas" | "canceladas">("todas");
  const [query, setQuery] = useState("");
  const list = recentSales.filter((sale, index) => {
    const code = orderNumber(index);
    void sale;
    return query === "" || code.includes(query);
  });

  return (
    <>
      <PageHeader subtitle="Historico e desempenho de vendas" title="Vendas" />
      <div className="source-stat-grid source-stat-grid-four">
        <StatCard icon="cart" label="Vendas" tone="primary" value={String(dashboard.salesCount)} />
        <StatCard icon="dollar" label="Faturamento" tone="success" value={formatMoney(dashboard.revenueCents)} />
        <StatCard icon="trending" label="Ticket medio" tone="info" value={formatMoney(dashboard.averageTicketCents)} />
        <StatCard icon="percent" label="Margem" tone="warning" value={formatPercent(getMarginPercent(dashboard))} />
      </div>
      <SectionCard action={
        <div className="source-filter-row">
          <input onChange={(event) => setQuery(event.target.value)} placeholder="Buscar cliente/codigo" value={query} />
          <select onChange={(event) => setFilter(event.target.value as typeof filter)} value={filter}>
            <option value="todas">Todas</option>
            <option value="concluidas">Concluidas</option>
            <option value="canceladas">Canceladas</option>
          </select>
        </div>
      } title="Historico de vendas">
        <div className="source-table-wrap">
          <table className="source-table">
            <thead><tr><th>Venda</th><th>Data/Hora</th><th>Cliente</th><th>Itens</th><th>Total</th><th>Pagto</th><th>Situacao</th><th className="source-right">Acoes</th></tr></thead>
            <tbody>
              {list.map((sale, index) => (
                <tr key={sale.orderId}>
                  <td className="source-primary-text">#{orderNumber(index)}</td>
                  <td>{formatSaleDate(sale.completedAt)}</td>
                  <td>{index % 3 === 0 ? "Consumidor final" : index % 3 === 1 ? "Carlos Silva" : "Mariana Souza"}</td>
                  <td>{index + 1}</td>
                  <td>{formatMoney(sale.totalCents)}</td>
                  <td>{paymentLabel(sale.paymentMethod)}</td>
                  <td><Badge tone="success">Concluida</Badge></td>
                  <td className="source-right"><button className="source-danger-link" onClick={() => onAction(`Cancelamento da venda ${sale.orderId.slice(0, 8)} requer motivo e auditoria`)} type="button">Cancelar</button></td>
                </tr>
              ))}
              {list.length === 0 ? <tr><td className="source-empty" colSpan={8}>Nenhuma venda encontrada.</td></tr> : null}
            </tbody>
          </table>
        </div>
      </SectionCard>
    </>
  );
}
