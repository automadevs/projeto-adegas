import { formatMoney, formatShortDate } from "../_lib/format";
import type { Product, PurchaseInput, PurchaseOrder, Supplier } from "../_lib/types";
import { Icon } from "../_components/icons";
import { PurchaseModal } from "../_components/modals";
import { Badge, PageHeader, SectionCard } from "../_components/ui";
import { useState } from "react";

export function PurchasesScreen({
  onCreatePurchase,
  onReceivePurchase,
  products,
  purchases,
  suppliers
}: {
  readonly onCreatePurchase: (input: PurchaseInput) => Promise<void>;
  readonly onReceivePurchase: (purchase: PurchaseOrder) => Promise<void>;
  readonly products: readonly Product[];
  readonly purchases: readonly PurchaseOrder[];
  readonly suppliers: readonly Supplier[];
}) {
  const [show, setShow] = useState(false);

  return (
    <>
      <PageHeader actions={<button className="source-primary" onClick={() => setShow(true)} type="button"><Icon name="plus" /> Nova compra</button>} subtitle="Ordens de compra e recebimentos" title="Compras" />
      <SectionCard title="Ordens de compra">
        <div className="source-table-wrap">
          <table className="source-table">
            <thead><tr><th>Data</th><th>Fornecedor</th><th>Itens</th><th>Total</th><th>Situacao</th><th className="source-right">Acoes</th></tr></thead>
            <tbody>
              {purchases.map((purchase) => (
                <tr key={purchase.id}>
                  <td>{formatShortDate(purchase.orderedAt)}</td>
                  <td>Fornecedor vinculado</td>
                  <td>-</td>
                  <td>{formatMoney(purchase.totalCents)}</td>
                  <td><Badge tone={purchase.status === "RECEIVED" || purchase.status === "Recebida" ? "success" : purchase.status === "CANCELLED" ? "destructive" : "warning"}>{purchase.status}</Badge></td>
                  <td className="source-right">{purchase.status !== "RECEIVED" ? <button className="source-link" onClick={() => void onReceivePurchase(purchase)} type="button">Receber</button> : null}</td>
                </tr>
              ))}
              {purchases.length === 0 ? <tr><td className="source-empty" colSpan={6}>Nenhuma compra registrada.</td></tr> : null}
            </tbody>
          </table>
        </div>
      </SectionCard>
      {show ? <PurchaseModal onClose={() => setShow(false)} onSave={(input) => { void onCreatePurchase(input); setShow(false); }} products={products} suppliers={suppliers} /> : null}
    </>
  );
}
