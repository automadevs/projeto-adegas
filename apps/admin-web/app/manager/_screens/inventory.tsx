import { useMemo, useState } from "react";

import { formatInteger, formatMoney } from "../_lib/format";
import type { ManagerData, Product } from "../_lib/types";
import { Icon } from "../_components/icons";
import { ProductThumb } from "../_components/product-thumb";
import { MovementTable } from "../_components/tables";
import { Badge, PageHeader, SectionCard, SegmentedFilter, StatCard } from "../_components/ui";

export function InventoryScreen({
  managerData,
  onAdjustStock,
  products
}: {
  readonly managerData: ManagerData;
  readonly onAdjustStock: (product: Product, quantity: number, reason: string) => Promise<void>;
  readonly products: readonly Product[];
}) {
  const [filter, setFilter] = useState<"todos" | "baixo" | "zerado">("todos");
  const stats = useMemo(() => {
    const totalItens = products.reduce((sum, product) => sum + Number(product.stockOnHand), 0);
    const valor = products.reduce((sum, product) => sum + Number(product.stockOnHand) * Number(product.costPriceCents), 0);
    const baixo = products.filter((product) => product.stockStatus === "low").length;
    const zerado = products.filter((product) => product.stockStatus === "zero" || Number(product.stockOnHand) <= 0).length;
    return { baixo, totalItens, valor, zerado };
  }, [products]);
  const list = products.filter((product) => {
    if (filter === "baixo") return product.stockStatus === "low";
    if (filter === "zerado") return product.stockStatus === "zero" || Number(product.stockOnHand) <= 0;
    return true;
  });

  return (
    <>
      <PageHeader subtitle="Controle e reposicao do inventario" title="Estoque" />
      <div className="source-stat-grid source-stat-grid-four">
        <StatCard icon="cube" label="Itens em estoque" tone="primary" value={formatInteger(stats.totalItens)} />
        <StatCard icon="box" label="Valor do estoque" tone="success" value={formatMoney(stats.valor)} />
        <StatCard icon="alert" label="Estoque baixo" tone="warning" value={String(stats.baixo)} />
        <StatCard icon="arrow-down" label="Zerados" tone="destructive" value={String(stats.zerado)} />
      </div>
      <SectionCard action={<SegmentedFilter current={filter} onChange={setFilter} values={["todos", "baixo", "zerado"]} />} title="Produtos em estoque">
        <div className="source-table-wrap">
          <table className="source-table">
            <thead><tr><th>Produto</th><th>SKU</th><th>Custo</th><th>Estoque</th><th>Minimo</th><th>Valor</th><th className="source-right">Ajuste</th></tr></thead>
            <tbody>
              {list.map((product) => (
                <tr key={product.id}>
                  <td><div className="source-product-cell"><ProductThumb product={product} /><strong>{product.name}</strong></div></td>
                  <td>{product.sku}</td>
                  <td>{formatMoney(product.costPriceCents)}</td>
                  <td><Badge tone={product.stockStatus === "zero" ? "destructive" : product.stockStatus === "low" ? "warning" : "success"}>{product.stockOnHand}</Badge></td>
                  <td>{product.minStock}</td>
                  <td>{formatMoney(Number(product.stockOnHand) * Number(product.costPriceCents))}</td>
                  <td className="source-right">
                    <div className="source-icon-actions">
                      <button onClick={() => void onAdjustStock(product, -1, "Ajuste manual de estoque")} type="button"><Icon name="minus" /></button>
                      <button onClick={() => void onAdjustStock(product, 1, "Ajuste manual de estoque")} type="button"><Icon name="plus" /></button>
                      <button className="source-small-button" onClick={() => {
                        const value = window.prompt(`Novo estoque para ${product.name}`, product.stockOnHand);
                        if (value === null) return;
                        const target = Math.max(0, Number(value) || 0);
                        void onAdjustStock(product, target - Number(product.stockOnHand), "Definicao manual de estoque");
                      }} type="button">Definir</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>
      <SectionCard title="Movimentacoes auditaveis">
        <MovementTable movements={managerData.inventoryMovements} />
      </SectionCard>
    </>
  );
}
