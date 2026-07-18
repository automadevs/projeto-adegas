import { dateRangeOptions, type DateRangeValue } from "../_lib/constants";
import { Icon } from "./icons";

export function DateFilter({
  compareEnabled,
  compareEnd,
  compareStart,
  compareSummary,
  datePanelOpen,
  dateRange,
  dateRangeEnd,
  dateRangeStart,
  dateSummary,
  onApply,
  onPreset,
  setCompareEnabled,
  setCompareEnd,
  setCompareStart,
  setDatePanelOpen,
  setDateRangeEnd,
  setDateRangeStart
}: {
  readonly compareEnabled: boolean;
  readonly compareEnd: string;
  readonly compareStart: string;
  readonly compareSummary: string;
  readonly datePanelOpen: boolean;
  readonly dateRange: DateRangeValue;
  readonly dateRangeEnd: string;
  readonly dateRangeStart: string;
  readonly dateSummary: string;
  readonly onApply: () => void;
  readonly onPreset: (range: DateRangeValue) => void;
  readonly setCompareEnabled: (value: boolean) => void;
  readonly setCompareEnd: (value: string) => void;
  readonly setCompareStart: (value: string) => void;
  readonly setDatePanelOpen: (value: boolean | ((current: boolean) => boolean)) => void;
  readonly setDateRangeEnd: (value: string) => void;
  readonly setDateRangeStart: (value: string) => void;
}) {
  return (
    <div className="date-filter-wrap">
      <button className="topbar-select date-filter date-filter-button" onClick={() => setDatePanelOpen((current) => !current)} type="button">
        <Icon name="calendar" />
        <span>{dateSummary}</span>
        {compareEnabled ? <small>vs {compareSummary}</small> : null}
        <Icon name="chevron" />
      </button>
      {datePanelOpen ? (
        <div className="date-popover">
          <header>
            <strong>Periodo</strong>
            <button onClick={() => setDatePanelOpen(false)} type="button"><Icon name="close" /></button>
          </header>
          <div className="date-presets">
            {dateRangeOptions.map((option) => (
              <button className={dateRange === option.value ? "active" : ""} key={option.value} onClick={() => onPreset(option.value)} type="button">{option.label}</button>
            ))}
          </div>
          <div className="date-fields">
            <label><span>Inicio</span><input onChange={(event) => setDateRangeStart(event.target.value)} type="date" value={dateRangeStart} /></label>
            <label><span>Fim</span><input onChange={(event) => setDateRangeEnd(event.target.value)} type="date" value={dateRangeEnd} /></label>
          </div>
          <label className="compare-toggle">
            <input checked={compareEnabled} onChange={(event) => setCompareEnabled(event.target.checked)} type="checkbox" /> Comparar periodo
          </label>
          {compareEnabled ? (
            <div className="date-fields">
              <label><span>Comparar inicio</span><input onChange={(event) => setCompareStart(event.target.value)} type="date" value={compareStart} /></label>
              <label><span>Comparar fim</span><input onChange={(event) => setCompareEnd(event.target.value)} type="date" value={compareEnd} /></label>
            </div>
          ) : null}
          <button className="date-apply" onClick={onApply} type="button">Aplicar periodo</button>
        </div>
      ) : null}
    </div>
  );
}
