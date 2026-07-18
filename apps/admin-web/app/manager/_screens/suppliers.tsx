import { useState } from "react";

import type { Supplier, SupplierInput } from "../_lib/types";
import { Icon } from "../_components/icons";
import { SupplierModal } from "../_components/modals";
import { PageHeader, SectionCard } from "../_components/ui";

export function SuppliersScreen({
  onSaveSupplier,
  suppliers
}: {
  readonly onSaveSupplier: (input: SupplierInput, supplierId?: string) => Promise<void>;
  readonly suppliers: readonly Supplier[];
}) {
  const [edit, setEdit] = useState<Supplier | null>(null);
  const [show, setShow] = useState(false);

  return (
    <>
      <PageHeader actions={<button className="source-primary" onClick={() => setShow(true)} type="button"><Icon name="plus" /> Novo fornecedor</button>} subtitle={`${suppliers.length} fornecedores ativos`} title="Fornecedores" />
      <SectionCard title="Fornecedores">
        <div className="source-table-wrap">
          <table className="source-table">
            <thead><tr><th>Nome</th><th>Contato</th><th>Telefone</th><th>E-mail</th><th>Prazo</th><th className="source-right">Acoes</th></tr></thead>
            <tbody>
              {suppliers.map((supplier) => (
                <tr key={supplier.id}>
                  <td><strong>{supplier.name}</strong></td>
                  <td>{supplier.contactName ?? "-"}</td>
                  <td>{supplier.whatsapp ?? supplier.phone ?? "-"}</td>
                  <td>{supplier.email ?? "-"}</td>
                  <td>{supplier.leadTimeDays ?? 0} dias</td>
                  <td className="source-right"><div className="source-icon-actions"><button onClick={() => setEdit(supplier)} type="button"><Icon name="pencil" /></button></div></td>
                </tr>
              ))}
              {suppliers.length === 0 ? <tr><td className="source-empty" colSpan={6}>Nenhum fornecedor cadastrado.</td></tr> : null}
            </tbody>
          </table>
        </div>
      </SectionCard>
      {(show || edit) ? <SupplierModal onClose={() => { setEdit(null); setShow(false); }} onSave={(input) => { void onSaveSupplier(input, edit?.id); setEdit(null); setShow(false); }} supplier={edit} /> : null}
    </>
  );
}
