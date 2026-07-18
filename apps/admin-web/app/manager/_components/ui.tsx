import type { ReactNode } from "react";

import { Icon, type IconName } from "./icons";

export type BadgeTone = "muted" | "success" | "warning" | "destructive" | "primary";

export function PageHeader({ actions, subtitle, title }: { readonly actions?: ReactNode; readonly subtitle?: string; readonly title: string }) {
  return (
    <div className="source-page-header">
      <div>
        <h1>{title}</h1>
        {subtitle ? <p>{subtitle}</p> : null}
      </div>
      {actions ? <div className="source-page-actions">{actions}</div> : null}
    </div>
  );
}

export function StatCard({
  delta,
  hint,
  icon,
  label,
  tone = "primary",
  value
}: {
  readonly delta?: string;
  readonly hint?: string;
  readonly icon: IconName;
  readonly label: string;
  readonly tone?: BadgeTone | "info";
  readonly value: string;
}) {
  return (
    <article className="source-stat-card">
      <div className="source-stat-top">
        <span>{label}</span>
        {delta ? <em>{delta}</em> : null}
      </div>
      <div className="source-stat-main">
        <div>
          <strong>{value}</strong>
          {hint ? <small>{hint}</small> : null}
        </div>
        <i className={`source-stat-icon ${tone}`}><Icon name={icon} /></i>
      </div>
    </article>
  );
}

export function SectionCard({ action, children, title }: { readonly action?: ReactNode; readonly children: ReactNode; readonly title: string }) {
  return (
    <section className="source-card">
      <header>
        <strong>{title}</strong>
        {action}
      </header>
      <div className="source-card-body">{children}</div>
    </section>
  );
}

export function Badge({ children, tone = "muted" }: { readonly children: ReactNode; readonly tone?: BadgeTone }) {
  return <span className={`source-badge ${tone}`}>{children}</span>;
}

export function PeriodSel() {
  return <select className="source-period"><option>Diario</option><option>Semanal</option><option>Mensal</option></select>;
}

export function SegmentedFilter<TValue extends string>({
  current,
  onChange,
  values
}: {
  readonly current: TValue;
  readonly onChange: (value: TValue) => void;
  readonly values: readonly TValue[];
}) {
  return (
    <div className="source-segmented">
      {values.map((value) => (
        <button className={current === value ? "active" : ""} key={value} onClick={() => onChange(value)} type="button">{value}</button>
      ))}
    </div>
  );
}

export function ModalShell({
  children,
  onClose,
  title,
  wide = false
}: {
  readonly children: ReactNode;
  readonly onClose: () => void;
  readonly title: string;
  readonly wide?: boolean;
}) {
  return (
    <div className="source-modal-backdrop">
      <div className={wide ? "source-modal wide" : "source-modal"}>
        <header>
          <h3>{title}</h3>
          <button onClick={onClose} type="button"><Icon name="close" /></button>
        </header>
        {children}
      </div>
    </div>
  );
}

export function ModalActions({ onClose }: { readonly onClose: () => void }) {
  return (
    <div className="source-modal-actions wide">
      <button className="source-ghost" onClick={onClose} type="button">Cancelar</button>
      <button className="source-primary" type="submit">Salvar</button>
    </div>
  );
}

export function FInput({
  className = "",
  defaultValue,
  label,
  name,
  required = false,
  type = "text"
}: {
  readonly className?: string;
  readonly defaultValue?: number | string | null;
  readonly label: string;
  readonly name: string;
  readonly required?: boolean;
  readonly type?: string;
}) {
  return (
    <label className={`source-field ${className}`}>
      <span>{label}</span>
      <input defaultValue={defaultValue ?? ""} name={name} required={required} step={type === "number" ? "0.01" : undefined} type={type} />
    </label>
  );
}

export function FSelect({
  defaultValue,
  label,
  name,
  options
}: {
  readonly defaultValue?: string;
  readonly label: string;
  readonly name: string;
  readonly options: readonly string[];
}) {
  return (
    <label className="source-field">
      <span>{label}</span>
      <select defaultValue={defaultValue} name={name}>
        {options.map((option) => <option key={option}>{option}</option>)}
      </select>
    </label>
  );
}

export function InfoRows({ rows }: { readonly rows: readonly (readonly [string, string])[] }) {
  return <div className="source-info-rows">{rows.map(([label, value]) => <div key={label}><span>{label}</span><strong>{value}</strong></div>)}</div>;
}

export function Toggle({ defaultChecked = false, label }: { readonly defaultChecked?: boolean; readonly label: string }) {
  return <label className="source-toggle"><span>{label}</span><input defaultChecked={defaultChecked} type="checkbox" /></label>;
}
