import { useState } from "react";
import type { FormEvent } from "react";

import { categories } from "../_lib/constants";
import { centsToInput, formatMoney, toCents } from "../_lib/format";
import type { Product, ProductFormInput, PurchaseInput, Supplier, SupplierInput } from "../_lib/types";
import { Icon } from "./icons";
import { FInput, FSelect, ModalActions, ModalShell } from "./ui";

export function ProductModal({
  onClose,
  onSave,
  product
}: {
  readonly onClose: () => void;
  readonly onSave: (input: ProductFormInput) => void;
  readonly product: Product | null;
}) {
  function submit(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    onSave({
      active: form.get("active") === "on",
      barcode: String(form.get("barcode") ?? ""),
      category: String(form.get("category") ?? "Outros"),
      costPrice: String(form.get("costPrice") ?? "0"),
      currentStock: String(form.get("currentStock") ?? product?.stockOnHand ?? "0"),
      minStock: String(form.get("minStock") ?? "0"),
      name: String(form.get("name") ?? ""),
      salePrice: String(form.get("salePrice") ?? "0"),
      sku: String(form.get("sku") ?? ""),
      unit: String(form.get("unit") ?? "un")
    });
  }

  return (
    <ModalShell onClose={onClose} title={product ? "Editar produto" : "Novo produto"}>
      <form className="source-modal-grid" onSubmit={submit}>
        <FInput defaultValue={product?.sku} label="SKU" name="sku" required />
        <FInput defaultValue={product?.barcode ?? ""} label="Cod. barras" name="barcode" />
        <FInput className="wide" defaultValue={product?.name} label="Nome" name="name" required />
        <FInput defaultValue={product?.unit} label="Unidade" name="unit" />
        <FSelect defaultValue={product?.category ?? "Cerveja"} label="Categoria" name="category" options={categories.filter((item) => item !== "Todas")} />
        <FInput defaultValue={centsToInput(product?.salePriceCents)} label="Preco venda" name="salePrice" type="number" />
        <FInput defaultValue={centsToInput(product?.costPriceCents)} label="Custo" name="costPrice" type="number" />
        <FInput defaultValue={product?.stockOnHand ?? "0"} label="Estoque atual" name="currentStock" type="number" />
        <FInput defaultValue={product?.minStock ?? "0"} label="Estoque minimo" name="minStock" type="number" />
        <label className="source-checkbox wide">
          <input defaultChecked={product?.active ?? true} name="active" type="checkbox" /> Produto ativo
        </label>
        <ModalActions onClose={onClose} />
      </form>
    </ModalShell>
  );
}

export function PayableModal({
  onClose,
  onSubmit
}: {
  readonly onClose: () => void;
  readonly onSubmit: (input: { readonly amount: string; readonly description: string; readonly dueDate: string }) => void;
}) {
  return (
    <ModalShell onClose={onClose} title="Nova conta a pagar">
      <form className="source-modal-stack" onSubmit={(event) => {
        event.preventDefault();
        const form = new FormData(event.currentTarget);
        onSubmit({
          amount: String(form.get("amount") ?? "0"),
          description: String(form.get("description") ?? ""),
          dueDate: String(form.get("dueDate") ?? new Date().toISOString().slice(0, 10))
        });
      }}>
        <FInput label="Descricao" name="description" required />
        <FInput label="Categoria" name="category" />
        <FInput label="Valor (R$)" name="amount" required type="number" />
        <FInput label="Vencimento" name="dueDate" required type="date" />
        <ModalActions onClose={onClose} />
      </form>
    </ModalShell>
  );
}

export function SupplierModal({
  onClose,
  onSave,
  supplier
}: {
  readonly onClose: () => void;
  readonly onSave: (input: SupplierInput) => void;
  readonly supplier: Supplier | null;
}) {
  return (
    <ModalShell onClose={onClose} title={supplier ? "Editar fornecedor" : "Novo fornecedor"}>
      <form className="source-modal-stack" onSubmit={(event) => {
        event.preventDefault();
        const form = new FormData(event.currentTarget);
        onSave({
          contactName: String(form.get("contactName") ?? ""),
          email: String(form.get("email") ?? ""),
          leadTimeDays: String(form.get("leadTimeDays") ?? "0"),
          name: String(form.get("name") ?? ""),
          phone: String(form.get("phone") ?? ""),
          whatsapp: String(form.get("whatsapp") ?? "")
        });
      }}>
        <FInput defaultValue={supplier?.name} label="Nome" name="name" required />
        <FInput defaultValue={supplier?.contactName ?? ""} label="Contato" name="contactName" />
        <FInput defaultValue={supplier?.phone ?? ""} label="Telefone" name="phone" />
        <FInput defaultValue={supplier?.whatsapp ?? ""} label="WhatsApp" name="whatsapp" />
        <FInput defaultValue={supplier?.email ?? ""} label="E-mail" name="email" type="email" />
        <FInput defaultValue={supplier?.leadTimeDays ?? 0} label="Prazo (dias)" name="leadTimeDays" type="number" />
        <ModalActions onClose={onClose} />
      </form>
    </ModalShell>
  );
}

export function PurchaseModal({
  onClose,
  onSave,
  products,
  suppliers
}: {
  readonly onClose: () => void;
  readonly onSave: (input: PurchaseInput) => void;
  readonly products: readonly Product[];
  readonly suppliers: readonly Supplier[];
}) {
  const [items, setItems] = useState<{ productId: string; quantity: number; unitCost: string }[]>([]);
  const [supplierId, setSupplierId] = useState(suppliers[0]?.id ?? "");
  const total = items.reduce((sum, item) => sum + toCents(item.unitCost) * item.quantity, 0);

  return (
    <ModalShell onClose={onClose} title="Nova compra" wide>
      <div className="source-modal-stack">
        <label className="source-field">
          <span>Fornecedor</span>
          <select onChange={(event) => setSupplierId(event.target.value)} value={supplierId}>
            {suppliers.map((supplier) => <option key={supplier.id} value={supplier.id}>{supplier.name}</option>)}
          </select>
        </label>
        <div className="purchase-items">
          <strong>Itens</strong>
          {items.map((item, index) => (
            <div className="purchase-item-row" key={`${item.productId}-${index}`}>
              <select onChange={(event) => setItems((current) => current.map((entry, itemIndex) => itemIndex === index ? { ...entry, productId: event.target.value } : entry))} value={item.productId}>
                {products.map((product) => <option key={product.id} value={product.id}>{product.name}</option>)}
              </select>
              <input min={1} onChange={(event) => setItems((current) => current.map((entry, itemIndex) => itemIndex === index ? { ...entry, quantity: Number(event.target.value) || 1 } : entry))} type="number" value={item.quantity} />
              <input onChange={(event) => setItems((current) => current.map((entry, itemIndex) => itemIndex === index ? { ...entry, unitCost: event.target.value } : entry))} type="number" value={item.unitCost} />
              <button onClick={() => setItems((current) => current.filter((_, itemIndex) => itemIndex !== index))} type="button"><Icon name="trash" /></button>
            </div>
          ))}
          <button className="source-dashed" onClick={() => {
            const product = products[0];
            if (!product) return;
            setItems((current) => [...current, { productId: product.id, quantity: 1, unitCost: centsToInput(product.costPriceCents) }]);
          }} type="button">+ Adicionar item</button>
        </div>
        <div className="source-modal-total">
          <span>Total</span>
          <strong>{formatMoney(total)}</strong>
        </div>
        <div className="source-modal-actions">
          <button className="source-ghost" onClick={onClose} type="button">Cancelar</button>
          <button className="source-primary" disabled={items.length === 0 || supplierId === ""} onClick={() => onSave({ items, supplierId })} type="button">Salvar compra</button>
        </div>
      </div>
    </ModalShell>
  );
}
