import { formatMoney, formatSaleDate, formatShortDate, orderNumber, paymentLabel } from "../_lib/format";
import type { AccountPayable, AccountReceivable, Dashboard, InventoryMovement, Product, ReportExport } from "../_lib/types";
import { Icon } from "./icons";
import { Badge } from "./ui";

export function LowStockTable({ lowStock, onOpenStock }: { readonly lowStock: readonly Product[]; readonly onOpenStock: () => void }) {
  return (
    <table className="source-table compact dashboard-table sales-dashboard-table">
      <thead>
        <tr>
          <th>Produto</th>
          <th>Saldo</th>
          <th className="source-right">Acao</th>
        </tr>
      </thead>
      <tbody>
        {lowStock.map((product) => (
          <tr key={product.id}>
            <td>
              <div className="source-product-cell">
                <span><strong>{product.name}</strong><small>{product.sku}</small></span>
              </div>
            </td>
            <td><Badge tone={product.stockStatus === "zero" ? "destructive" : "warning"}>{product.stockOnHand}/{product.minStock}</Badge></td>
            <td className="source-right">
              <button className="source-link" onClick={onOpenStock} type="button">Ver</button>
            </td>
          </tr>
        ))}
        {lowStock.length === 0 ? <tr><td className="source-empty" colSpan={3}>Nenhum alerta de estoque.</td></tr> : null}
      </tbody>
    </table>
  );
}

export function RecentSalesTable({ recentSales }: { readonly recentSales: readonly Dashboard["recentSales"][number][] }) {
  return (
    <table className="source-table compact dashboard-table">
      <thead>
        <tr>
          <th>Venda</th>
          <th>Total</th>
          <th>Situacao</th>
        </tr>
      </thead>
      <tbody>
        {recentSales.slice(0, 8).map((sale, index) => (
          <tr key={sale.orderId}>
            <td className="source-primary-text"><strong>#{orderNumber(index)}</strong><small>{index % 2 === 0 ? "Consumidor final" : "Carlos Silva"} - {paymentLabel(sale.paymentMethod)}</small></td>
            <td><strong>{formatMoney(sale.totalCents)}</strong></td>
            <td><Badge tone="success">Concluida</Badge></td>
          </tr>
        ))}
        {recentSales.length === 0 ? <tr><td className="source-empty" colSpan={3}>Nenhuma venda recente.</td></tr> : null}
      </tbody>
    </table>
  );
}

export function TopProductsList({ topProducts }: { readonly topProducts: readonly Dashboard["topProducts"][number][] }) {
  if (topProducts.length === 0) {
    return <p className="source-muted">Sem vendas suficientes para ranking.</p>;
  }

  return (
    <ol className="source-rank-list">
      {topProducts.slice(0, 5).map((product, index) => (
        <li key={`${product.name}-${index}`}>
          <span>{index + 1}</span>
          <div>
            <strong>{product.name}</strong>
            <small>{product.quantity} un. - {formatMoney(product.revenueCents)}</small>
          </div>
        </li>
      ))}
    </ol>
  );
}

export function PayablesTable({
  onPayPayable,
  payables
}: {
  readonly onPayPayable: (payable: AccountPayable) => Promise<void>;
  readonly payables: readonly AccountPayable[];
}) {
  return (
    <table className="source-table">
      <thead>
        <tr>
          <th>Descricao</th>
          <th>Categoria</th>
          <th>Vence</th>
          <th>Valor</th>
          <th className="source-right">Acoes</th>
        </tr>
      </thead>
      <tbody>
        {payables.map((item) => (
          <tr key={item.id}>
            <td><strong>{item.description}</strong></td>
            <td>Geral</td>
            <td>{formatShortDate(item.dueDate)}</td>
            <td>{formatMoney(item.amountCents)}</td>
            <td className="source-right">
              <button className="source-link" onClick={() => void onPayPayable(item)} type="button">
                <Icon name="check" /> Pagar
              </button>
            </td>
          </tr>
        ))}
        {payables.length === 0 ? <tr><td className="source-empty" colSpan={5}>Nenhuma conta a pagar.</td></tr> : null}
      </tbody>
    </table>
  );
}

export function ReceivablesTable({
  onSettleReceivable,
  receivables
}: {
  readonly onSettleReceivable: (receivable: AccountReceivable) => Promise<void>;
  readonly receivables: readonly AccountReceivable[];
}) {
  return (
    <table className="source-table">
      <thead>
        <tr>
          <th>Cliente</th>
          <th>Descricao</th>
          <th>Vence</th>
          <th>Valor</th>
          <th className="source-right">Acoes</th>
        </tr>
      </thead>
      <tbody>
        {receivables.map((item) => (
          <tr key={item.id}>
            <td><strong>Cliente</strong></td>
            <td>{item.description}</td>
            <td>{formatShortDate(item.dueDate)}</td>
            <td>{formatMoney(item.netExpectedCents)}</td>
            <td className="source-right">
              <button className="source-link" onClick={() => void onSettleReceivable(item)} type="button">
                <Icon name="check" /> Receber
              </button>
            </td>
          </tr>
        ))}
        {receivables.length === 0 ? <tr><td className="source-empty" colSpan={5}>Nenhuma conta a receber.</td></tr> : null}
      </tbody>
    </table>
  );
}

export function MovementTable({ movements }: { readonly movements: readonly InventoryMovement[] }) {
  return (
    <table className="source-table compact">
      <thead>
        <tr>
          <th>Produto</th>
          <th>Movimento</th>
          <th>Qtd.</th>
          <th>Custo</th>
          <th>Data</th>
        </tr>
      </thead>
      <tbody>
        {movements.slice(0, 8).map((movement) => (
          <tr key={movement.id}>
            <td>{movement.productName}</td>
            <td>{movement.type}</td>
            <td>{movement.quantity}</td>
            <td>{formatMoney(movement.unitCostCents)}</td>
            <td>{formatSaleDate(movement.createdAt)}</td>
          </tr>
        ))}
        {movements.length === 0 ? <tr><td className="source-empty" colSpan={5}>Nenhuma movimentacao registrada.</td></tr> : null}
      </tbody>
    </table>
  );
}

export function ReportTable({ reports }: { readonly reports: readonly ReportExport[] }) {
  return (
    <table className="source-table compact">
      <thead>
        <tr>
          <th>Relatorio</th>
          <th>Formato</th>
          <th>Status</th>
          <th>Expira</th>
        </tr>
      </thead>
      <tbody>
        {reports.slice(0, 6).map((report) => (
          <tr key={report.id}>
            <td>{report.type}</td>
            <td>{report.format.toUpperCase()}</td>
            <td><Badge tone="primary">{report.status}</Badge></td>
            <td>{report.expiresAt ? formatShortDate(report.expiresAt) : "-"}</td>
          </tr>
        ))}
        {reports.length === 0 ? <tr><td className="source-empty" colSpan={4}>Nenhuma exportacao gerada.</td></tr> : null}
      </tbody>
    </table>
  );
}
