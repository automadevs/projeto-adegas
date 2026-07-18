import { useMemo, useState } from "react";

import { categories } from "../_lib/constants";
import { formatMoney, normalize } from "../_lib/format";
import type { Product, ProductFormInput } from "../_lib/types";
import { Icon } from "../_components/icons";
import { ProductModal } from "../_components/modals";
import { ProductThumb } from "../_components/product-thumb";
import { Badge, PageHeader, SectionCard } from "../_components/ui";

export function ProductsScreen({
  onArchiveProduct,
  onSaveProduct,
  onToggleProduct,
  products
}: {
  readonly onArchiveProduct: (product: Product) => Promise<void>;
  readonly onSaveProduct: (input: ProductFormInput, productId?: string) => Promise<void>;
  readonly onToggleProduct: (product: Product) => Promise<void>;
  readonly products: readonly Product[];
}) {
  const [category, setCategory] = useState<(typeof categories)[number]>("Todas");
  const [edit, setEdit] = useState<Product | null>(null);
  const [query, setQuery] = useState("");
  const [showNew, setShowNew] = useState(false);

  const filtered = useMemo(() => products.filter((product) => {
    const matchesCategory = category === "Todas" || normalize(product.category) === normalize(category);
    const q = normalize(query);
    const matchesQuery = q === "" || normalize(product.name).includes(q) || normalize(product.sku).includes(q) || normalize(product.barcode ?? "").includes(q);
    return matchesCategory && matchesQuery;
  }), [category, products, query]);

  return (
    <>
      <PageHeader actions={<button className="source-primary" onClick={() => setShowNew(true)} type="button"><Icon name="plus" /> Novo produto</button>} subtitle={`${products.length} itens no catalogo`} title="Produtos" />
      <SectionCard action={
        <div className="source-filter-row">
          <label className="source-search"><Icon name="search" /><input onChange={(event) => setQuery(event.target.value)} placeholder="Buscar..." value={query} /></label>
          <select onChange={(event) => setCategory(event.target.value as (typeof categories)[number])} value={category}>{categories.map((item) => <option key={item}>{item}</option>)}</select>
        </div>
      } title="Catalogo">
        <div className="source-table-wrap">
          <table className="source-table">
            <thead><tr><th>Produto</th><th>SKU</th><th>Categoria</th><th>Preco</th><th>Custo</th><th>Estoque</th><th>Situacao</th><th className="source-right">Acoes</th></tr></thead>
            <tbody>
              {filtered.map((product) => (
                <tr key={product.id}>
                  <td><div className="source-product-cell"><ProductThumb product={product} /><div><strong>{product.name}</strong><small>{product.unit}</small></div></div></td>
                  <td>{product.sku}</td>
                  <td>{product.category}</td>
                  <td>{formatMoney(product.salePriceCents)}</td>
                  <td>{formatMoney(product.costPriceCents)}</td>
                  <td><Badge tone={product.stockStatus === "zero" ? "destructive" : product.stockStatus === "low" ? "warning" : "success"}>{product.stockOnHand}</Badge></td>
                  <td><button className="badge-button" onClick={() => void onToggleProduct(product)} type="button"><Badge tone={product.active ? "success" : "muted"}>{product.active ? "Ativo" : "Inativo"}</Badge></button></td>
                  <td className="source-right">
                    <div className="source-icon-actions">
                      <button onClick={() => setEdit(product)} title="Editar" type="button"><Icon name="pencil" /></button>
                      <button onClick={() => void onArchiveProduct(product)} title="Arquivar" type="button"><Icon name="trash" /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 ? <tr><td className="source-empty" colSpan={8}>Nenhum produto encontrado.</td></tr> : null}
            </tbody>
          </table>
        </div>
      </SectionCard>
      {(showNew || edit) ? (
        <ProductModal
          onClose={() => { setEdit(null); setShowNew(false); }}
          onSave={(input) => { void onSaveProduct(input, edit?.id); setEdit(null); setShowNew(false); }}
          product={edit}
        />
      ) : null}
    </>
  );
}
