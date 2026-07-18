import { useState } from "react";

import { formatMoney } from "../_lib/format";
import type { AccountPayable, AccountReceivable, ManagerData, PayableInput } from "../_lib/types";
import { Icon } from "../_components/icons";
import { PayableModal } from "../_components/modals";
import { PayablesTable, ReceivablesTable } from "../_components/tables";
import { PageHeader, SectionCard, StatCard } from "../_components/ui";

export function FinanceScreen({
  managerData,
  onCreatePayable,
  onPayPayable,
  onReconcile,
  onSettleReceivable
}: {
  readonly managerData: ManagerData;
  readonly onCreatePayable: (input: PayableInput) => Promise<void>;
  readonly onPayPayable: (payable: AccountPayable) => Promise<void>;
  readonly onReconcile: () => Promise<void>;
  readonly onSettleReceivable: (receivable: AccountReceivable) => Promise<void>;
}) {
  const [showPayable, setShowPayable] = useState(false);

  return (
    <>
      <PageHeader actions={<button className="source-primary" onClick={() => void onReconcile()} type="button">Conciliar</button>} subtitle="Fluxo de caixa, contas e recebiveis" title="Financeiro" />
      <div className="source-stat-grid source-stat-grid-four">
        <StatCard icon="arrow-up" label="A receber" tone="success" value={formatMoney(managerData.cashFlow.openReceivablesCents)} />
        <StatCard icon="arrow-down" label="A pagar" tone="destructive" value={formatMoney(managerData.cashFlow.openPayablesCents)} />
        <StatCard icon="cash" label="Saldo previsto" tone={Number(managerData.cashFlow.netCents) >= 0 ? "success" : "destructive"} value={formatMoney(managerData.cashFlow.netCents)} />
        <StatCard icon="cash" label="Caixa" tone="primary" value={formatMoney(managerData.cashFlow.inflowCents)} hint="Entradas do periodo" />
      </div>
      <div className="source-actions-row">
        <button className="source-ghost" onClick={() => setShowPayable(true)} type="button"><Icon name="plus" /> Nova conta a pagar</button>
      </div>
      <div className="source-grid source-grid-two">
        <SectionCard action={<button className="source-link" onClick={() => setShowPayable(true)} type="button"><Icon name="plus" /> Adicionar</button>} title="Contas a pagar">
          <PayablesTable onPayPayable={onPayPayable} payables={managerData.payables} />
        </SectionCard>
        <SectionCard title="Contas a receber">
          <ReceivablesTable onSettleReceivable={onSettleReceivable} receivables={managerData.receivables} />
        </SectionCard>
      </div>
      <SectionCard title="Historico de caixa">
        <div className="source-cash-summary">
          <span>Entradas <strong>{formatMoney(managerData.cashFlow.inflowCents)}</strong></span>
          <span>Saidas <strong>{formatMoney(managerData.cashFlow.outflowCents)}</strong></span>
          <span>DRE liquido <strong>{formatMoney(managerData.dre.netProfitCents)}</strong></span>
        </div>
      </SectionCard>
      {showPayable ? <PayableModal onClose={() => setShowPayable(false)} onSubmit={(input) => { void onCreatePayable(input); setShowPayable(false); }} /> : null}
    </>
  );
}
