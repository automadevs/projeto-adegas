"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

import { api } from "../_lib/api";
import { branchOptions, dateRangeOptions, emptyDashboard, emptyManagerData, managerRoutes, navItems, type DateRangeValue } from "../_lib/constants";
import { formatShortDate, navFromPath, toCents } from "../_lib/format";
import type {
  AccountPayable,
  AccountReceivable,
  AuditEvent,
  CashFlow,
  Dashboard,
  Dre,
  InventoryMovement,
  ManagerData,
  NavId,
  PayableInput,
  Product,
  ProductFormInput,
  PurchaseInput,
  PurchaseOrder,
  ReportExport,
  Supplier,
  SupplierInput
} from "../_lib/types";
import { DashboardScreen } from "../_screens/dashboard";
import { FinanceScreen } from "../_screens/finance";
import { InventoryScreen } from "../_screens/inventory";
import { ProductsScreen } from "../_screens/products";
import { PurchasesScreen } from "../_screens/purchases";
import { ReportsScreen } from "../_screens/reports";
import { SalesScreen } from "../_screens/sales";
import { SettingsScreen } from "../_screens/settings";
import { SuppliersScreen } from "../_screens/suppliers";
import { DateFilter } from "./date-filter";
import { Icon } from "./icons";
import { PhonePreview } from "./phone-preview";
import { EmployeesScreen } from "../_screens/employees";
import { DEMO_STORE_NAME } from "../../_lib/demo-config";

function isoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function daysAgo(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return isoDate(date);
}

export function ManagerShell() {
  const pathname = usePathname();
  const router = useRouter();
  const phoneRef = useRef<HTMLDivElement>(null);
  const [activeNav, setActiveNav] = useState<NavId>(() => navFromPath(pathname));
  const [audit, setAudit] = useState<AuditEvent[]>([]);
  const [branch, setBranch] = useState<(typeof branchOptions)[number]["value"]>("matriz");
  const [compareEnabled, setCompareEnabled] = useState(true);
  const [compareEnd, setCompareEnd] = useState(() => daysAgo(1));
  const [compareStart, setCompareStart] = useState(() => daysAgo(1));
  const [dashboard, setDashboard] = useState<Dashboard>(emptyDashboard);
  const [datePanelOpen, setDatePanelOpen] = useState(false);
  const [dateRange, setDateRange] = useState<DateRangeValue>("today");
  const [dateRangeEnd, setDateRangeEnd] = useState(() => isoDate(new Date()));
  const [dateRangeStart, setDateRangeStart] = useState(() => isoDate(new Date()));
  const [loading, setLoading] = useState(true);
  const [managerData, setManagerData] = useState<ManagerData>(emptyManagerData);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileOrderOpen, setMobileOrderOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [showPhone, setShowPhone] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [status, setStatus] = useState("Sincronizando operacao");

  async function refresh(filters: {
    readonly branchValue?: string;
    readonly compareEndValue?: string;
    readonly compareStartValue?: string;
    readonly end?: string;
    readonly start?: string;
  } = {}): Promise<void> {
    setLoading(true);
    try {
      const dashboardParams = new URLSearchParams({
        branch: filters.branchValue ?? branch,
        compareEnd: filters.compareEndValue ?? compareEnd,
        compareStart: filters.compareStartValue ?? compareStart,
        end: filters.end ?? dateRangeEnd,
        start: filters.start ?? dateRangeStart
      });
      const [
        items,
        financial,
        events,
        payables,
        receivables,
        cashFlow,
        dre,
        inventoryMovements,
        suppliers,
        purchases,
        reportExports
      ] = await Promise.all([
        api<Product[]>("/items"),
        api<Dashboard>(`/financial/dashboard?${dashboardParams.toString()}`),
        api<AuditEvent[]>("/audit/events"),
        api<AccountPayable[]>("/finance/payables"),
        api<AccountReceivable[]>("/finance/receivables"),
        api<CashFlow>("/finance/cash-flow"),
        api<Dre>("/finance/dre"),
        api<InventoryMovement[]>("/inventory/movements"),
        api<Supplier[]>("/suppliers"),
        api<PurchaseOrder[]>("/purchases"),
        api<ReportExport[]>("/reports/exports")
      ]);
      setProducts(items);
      setDashboard(financial);
      setManagerData({ cashFlow, dre, inventoryMovements, payables, purchases, receivables, reportExports, suppliers });
      setAudit(events);
      setStatus("Dados atualizados");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Falha ao carregar dados");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void refresh();
  }, []);

  useEffect(() => {
    setActiveNav(navFromPath(pathname));
  }, [pathname]);

  useEffect(() => {
    if (new URLSearchParams(window.location.search).get("order") === "1") {
      setShowPhone(true);
      setMobileOrderOpen(true);
    }
  }, [pathname]);

  function selectNav(navId: NavId): void {
    setActiveNav(navId);
    setMobileMenuOpen(false);
    setMobileOrderOpen(false);
    router.push(managerRoutes[navId]);
    setStatus(`${navItems.find((item) => item.id === navId)?.label ?? "Secao"} selecionado`);
  }

  function focusPhone(): void {
    setShowPhone(true);
    setMobileMenuOpen(false);
    setMobileOrderOpen(true);
    window.requestAnimationFrame(() => {
      phoneRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    });
    setStatus("AdegaOS Order aberto para venda");
  }

  function applyDateRange(nextRange: DateRangeValue): void {
    setDateRange(nextRange);
    let nextStart = dateRangeStart;
    let nextEnd = dateRangeEnd;
    let nextCompareStart = compareStart;
    let nextCompareEnd = compareEnd;
    if (nextRange === "today") {
      nextStart = isoDate(new Date());
      nextEnd = isoDate(new Date());
      nextCompareStart = daysAgo(1);
      nextCompareEnd = daysAgo(1);
    }
    if (nextRange === "7d") {
      nextStart = daysAgo(6);
      nextEnd = isoDate(new Date());
      nextCompareStart = daysAgo(13);
      nextCompareEnd = daysAgo(7);
    }
    if (nextRange === "30d") {
      nextStart = daysAgo(29);
      nextEnd = isoDate(new Date());
      nextCompareStart = daysAgo(59);
      nextCompareEnd = daysAgo(30);
    }
    setDateRangeStart(nextStart);
    setDateRangeEnd(nextEnd);
    setCompareStart(nextCompareStart);
    setCompareEnd(nextCompareEnd);
    void refresh({ compareEndValue: nextCompareEnd, compareStartValue: nextCompareStart, end: nextEnd, start: nextStart });
    setStatus(`Filtro aplicado: ${dateRangeOptions.find((option) => option.value === nextRange)?.label ?? nextRange}`);
  }

  async function saveProduct(input: ProductFormInput, productId?: string): Promise<void> {
    setLoading(true);
    try {
      const body = {
        active: input.active,
        barcode: input.barcode || undefined,
        category: input.category || "Outros",
        costPriceCents: toCents(input.costPrice),
        minStock: Number(input.minStock),
        name: input.name,
        salePriceCents: toCents(input.salePrice),
        sku: input.sku,
        unit: input.unit || "un"
      };

      const product = productId
        ? await api<Product>(`/products/${productId}`, { method: "PATCH", body: JSON.stringify(body) })
        : await api<Product>("/items", { method: "POST", body: JSON.stringify(body) });

      if (!productId && Number(input.currentStock) > 0) {
        await api<unknown>("/inventory/movements", {
          method: "POST",
          headers: { "idempotency-key": crypto.randomUUID() },
          body: JSON.stringify({
            itemId: product.id,
            quantity: Number(input.currentStock),
            reason: "Cadastro de produto",
            type: "INITIAL_BALANCE"
          })
        });
      }

      setStatus(productId ? `Produto atualizado: ${product.name}` : `Produto salvo: ${product.name}`);
      await refresh();
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Falha ao salvar produto");
    } finally {
      setLoading(false);
    }
  }

  async function archiveProduct(product: Product): Promise<void> {
    setLoading(true);
    try {
      await api<unknown>(`/products/${product.id}/archive`, { method: "POST" });
      setStatus(`Produto arquivado: ${product.name}`);
      await refresh();
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Falha ao arquivar produto");
    } finally {
      setLoading(false);
    }
  }

  async function toggleProduct(product: Product): Promise<void> {
    setLoading(true);
    try {
      await api<unknown>(`/products/${product.id}/availability`, {
        method: "POST",
        body: JSON.stringify({ active: !product.active })
      });
      setStatus(`${product.name}: ${product.active ? "indisponivel" : "disponivel"}`);
      await refresh();
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Falha ao alterar disponibilidade");
    } finally {
      setLoading(false);
    }
  }

  async function adjustStock(product: Product, quantity: number, reason: string): Promise<void> {
    if (quantity === 0) {
      return;
    }
    setLoading(true);
    try {
      await api<unknown>("/inventory/movements", {
        method: "POST",
        headers: { "idempotency-key": crypto.randomUUID() },
        body: JSON.stringify({ itemId: product.id, quantity, reason, type: "ADJUSTMENT" })
      });
      setStatus(`Estoque ajustado: ${product.name}`);
      await refresh();
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Falha ao ajustar estoque");
    } finally {
      setLoading(false);
    }
  }

  async function createPayable(input: PayableInput): Promise<void> {
    setLoading(true);
    try {
      await api<unknown>("/finance/payables", {
        method: "POST",
        body: JSON.stringify({
          amountCents: toCents(input.amount),
          competenceDate: input.dueDate,
          description: input.description,
          dueDate: input.dueDate
        })
      });
      setStatus("Conta a pagar criada");
      await refresh();
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Falha ao criar conta");
    } finally {
      setLoading(false);
    }
  }

  async function payPayable(payable: AccountPayable): Promise<void> {
    setLoading(true);
    try {
      await api<unknown>(`/finance/payables/${payable.id}/pay`, {
        method: "POST",
        body: JSON.stringify({ amountCents: Number(payable.openCents || payable.amountCents) })
      });
      setStatus(`Conta paga: ${payable.description}`);
      await refresh();
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Falha ao pagar conta");
    } finally {
      setLoading(false);
    }
  }

  async function settleReceivable(receivable: AccountReceivable): Promise<void> {
    setLoading(true);
    try {
      await api<unknown>(`/finance/receivables/${receivable.id}/settle`, {
        method: "POST",
        body: JSON.stringify({ amountCents: Number(receivable.openCents || receivable.netExpectedCents) })
      });
      setStatus(`Recebivel liquidado: ${receivable.description}`);
      await refresh();
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Falha ao liquidar recebivel");
    } finally {
      setLoading(false);
    }
  }

  async function reconcile(): Promise<void> {
    setLoading(true);
    try {
      await api<unknown>("/finance/reconciliation", { method: "POST" });
      setStatus("Conciliacao executada");
      await refresh();
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Falha na conciliacao");
    } finally {
      setLoading(false);
    }
  }

  async function saveSupplier(input: SupplierInput, supplierId?: string): Promise<void> {
    setLoading(true);
    try {
      await api<unknown>(supplierId ? `/suppliers/${supplierId}` : "/suppliers", {
        method: supplierId ? "PATCH" : "POST",
        body: JSON.stringify({
          active: true,
          contactName: input.contactName || undefined,
          email: input.email || undefined,
          leadTimeDays: Number(input.leadTimeDays || 0),
          name: input.name,
          phone: input.phone || undefined,
          whatsapp: input.whatsapp || undefined
        })
      });
      setStatus(supplierId ? "Fornecedor atualizado" : "Fornecedor criado");
      await refresh();
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Falha ao salvar fornecedor");
    } finally {
      setLoading(false);
    }
  }

  async function createPurchase(input: PurchaseInput): Promise<void> {
    setLoading(true);
    try {
      await api<unknown>("/purchases", {
        method: "POST",
        body: JSON.stringify({
          discountCents: 0,
          freightCents: 0,
          items: input.items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            unitCostCents: toCents(String(item.unitCost))
          })),
          supplierId: input.supplierId || undefined
        })
      });
      setStatus("Compra criada");
      await refresh();
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Falha ao criar compra");
    } finally {
      setLoading(false);
    }
  }

  async function receivePurchase(purchase: PurchaseOrder): Promise<void> {
    setLoading(true);
    try {
      await api<unknown>(`/purchases/${purchase.id}/receive`, { method: "POST" });
      setStatus(`Compra recebida: ${purchase.id.slice(0, 8)}`);
      await refresh();
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Falha ao receber compra");
    } finally {
      setLoading(false);
    }
  }

  async function createReportExport(format: ReportExport["format"] = "csv"): Promise<void> {
    setLoading(true);
    try {
      await api<ReportExport>("/reports/exports", {
        method: "POST",
        body: JSON.stringify({ filters: { branch, period: dateRange }, format, type: "manager-operational" })
      });
      setStatus(`Relatorio ${format.toUpperCase()} gerado`);
      await refresh();
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Falha ao gerar relatorio");
    } finally {
      setLoading(false);
    }
  }

  const lowStock = useMemo(() => {
    const list = products.filter((product) => product.stockStatus !== "normal" || Number(product.stockOnHand) <= Number(product.minStock));
    return list.slice(0, 8);
  }, [products]);
  const recentSales = dashboard.recentSales.slice(0, 10);
  const topProducts = dashboard.topProducts.slice(0, 8);
  const notificationCount = dashboard.lowStockCount + Math.min(recentSales.length, 9);
  const notificationItems = [
    ...lowStock.slice(0, 4).map((product) => ({
      category: "Estoque",
      date: "Agora",
      description: `${product.name} esta com ${product.stockOnHand} unidade(s), minimo ${product.minStock}.`,
      origin: "Manager > Estoque",
      priority: product.stockStatus === "zero" ? "high" : "medium",
      status: product.stockStatus === "zero" ? "Em falta" : "Acompanhar",
      title: product.stockStatus === "zero" ? "Produto em falta" : "Estoque baixo",
      user: "Sistema"
    })),
    ...recentSales.slice(0, 3).map((sale) => ({
      category: "Vendas",
      date: formatShortDate(sale.completedAt.slice(0, 10)),
      description: `Venda ${sale.orderId.slice(0, 8)} concluida via ${sale.paymentMethod}.`,
      origin: "Order > Venda rapida",
      priority: "low",
      status: "Concluida",
      title: "Venda recente",
      user: "Atendente"
    }))
  ];
  const dateSummary = dateRangeStart === dateRangeEnd ? formatShortDate(dateRangeStart) : `${formatShortDate(dateRangeStart)} - ${formatShortDate(dateRangeEnd)}`;
  const compareSummary = compareStart === compareEnd ? formatShortDate(compareStart) : `${formatShortDate(compareStart)} - ${formatShortDate(compareEnd)}`;
  const shellClass = [
    "admin-shell",
    sidebarCollapsed ? "sidebar-collapsed" : "",
    mobileMenuOpen ? "mobile-menu-open" : "",
    mobileOrderOpen ? "mobile-order-active" : ""
  ].filter(Boolean).join(" ");
  const workspaceClass = [
    "workspace",
    showPhone ? "" : "phone-hidden",
    mobileOrderOpen ? "mobile-order-active" : ""
  ].filter(Boolean).join(" ");

  return (
    <main className={shellClass}>
      <aside className={sidebarCollapsed ? "sidebar collapsed" : "sidebar"}>
        <div className="brand">
          <span className="brand-mark"><Icon name="bottle" /></span>
          <strong>AdegaOS</strong>
        </div>

        <nav className="nav-list">
          {navItems.map((item) => (
            <button className={activeNav === item.id ? "nav-item active" : "nav-item"} key={item.id} onClick={() => selectNav(item.id)} title={item.label} type="button">
              <Icon name={item.icon} />
              <span>{item.label}</span>
            </button>
          ))}
          <button className={mobileOrderOpen ? "nav-item mobile-order-tab active" : "nav-item mobile-order-tab"} onClick={focusPhone} title="Venda rapida" type="button">
            <Icon name="cart" />
            <span>Venda rapida</span>
          </button>
        </nav>

        <div className="sidebar-footer">
          <button className="store-switch" onClick={() => setStatus("Loja matriz selecionada")} type="button">
            <Icon name="store" />
            <span><strong>{DEMO_STORE_NAME}</strong><small>Loja matriz</small></span>
            <Icon name="chevron" />
          </button>
          <div className="profile"><span>JF</span><div><strong>Jose Ferreira</strong><small>Administrador</small></div></div>
          <button className="logout" onClick={() => setStatus("Sessao pronta para sair")} type="button"><Icon name="logout" /><span>Sair</span></button>
        </div>
      </aside>
      <button aria-hidden={!mobileMenuOpen} className={mobileMenuOpen ? "mobile-nav-backdrop open" : "mobile-nav-backdrop"} onClick={() => setMobileMenuOpen(false)} tabIndex={mobileMenuOpen ? 0 : -1} type="button" />

      <section className={workspaceClass}>
        <header className="topbar">
          <button className={mobileMenuOpen ? "mobile-menu-toggle open" : "mobile-menu-toggle"} onClick={() => setMobileMenuOpen((current) => !current)} type="button">
            <span />
            <span />
            <span />
          </button>
          <button className="icon-button sidebar-toggle" onClick={() => setSidebarCollapsed((current) => !current)} type="button">
            <Icon name="menu" />
          </button>
          <strong className="topbar-brand">AdegaOS</strong>
          <DateFilter
            compareEnabled={compareEnabled}
            compareEnd={compareEnd}
            compareStart={compareStart}
            compareSummary={compareSummary}
            datePanelOpen={datePanelOpen}
            dateRange={dateRange}
            dateRangeEnd={dateRangeEnd}
            dateRangeStart={dateRangeStart}
            dateSummary={dateSummary}
            onApply={() => {
              setDatePanelOpen(false);
              void refresh({
                branchValue: branch,
                compareEndValue: compareEnd,
                compareStartValue: compareStart,
                end: dateRangeEnd,
                start: dateRangeStart
              });
              setStatus(`Periodo aplicado: ${dateSummary}${compareEnabled ? ` vs ${compareSummary}` : ""}`);
            }}
            onPreset={applyDateRange}
            setCompareEnabled={setCompareEnabled}
            setCompareEnd={setCompareEnd}
            setCompareStart={setCompareStart}
            setDatePanelOpen={setDatePanelOpen}
            setDateRangeEnd={setDateRangeEnd}
            setDateRangeStart={setDateRangeStart}
          />
          <span className="topbar-spacer" />
          <button className="secondary-action" onClick={() => selectNav("produtos")} type="button"><Icon name="plus" /><span>Registrar produto</span></button>
          <button className="primary-action" onClick={focusPhone} type="button"><Icon name="cart" /><span>Realizar venda</span></button>
          <div className="notification-wrap">
            <button className="notification" onClick={() => {
              setNotificationsOpen((current) => !current);
              setStatus(`${notificationCount} notificacoes`);
            }} type="button">
              <Icon name="bell" />
              <span>{notificationCount}</span>
            </button>
            {notificationsOpen ? (
              <div className="notification-panel">
                <header>
                  <strong>Central de notificacoes</strong>
                  <button className="icon-button" onClick={() => setNotificationsOpen(false)} type="button"><Icon name="close" /></button>
                </header>
                <div className="notification-filters">
                  <button type="button">Todas</button>
                  <button type="button">Estoque</button>
                  <button type="button">Vendas</button>
                  <button type="button">Financeiro</button>
                </div>
                <div className="notification-list">
                  {notificationItems.length > 0 ? notificationItems.map((item, index) => (
                    <article className="notification-item" key={`${item.title}-${index}`}>
                      <div className="notification-item-top">
                        <span className={`notification-priority ${item.priority}`}>{item.priority === "high" ? "Alta" : item.priority === "medium" ? "Media" : "Baixa"}</span>
                        <span className="notification-status">{item.status}</span>
                      </div>
                      <strong>{item.title}</strong>
                      <p>{item.description}</p>
                      <div className="notification-meta">
                        <span>{item.category}</span>
                        <span>{item.date}</span>
                        <span>{item.user}</span>
                        <span>{item.origin}</span>
                      </div>
                    </article>
                  )) : <p className="empty-panel">Nenhuma notificacao operacional no periodo.</p>}
                </div>
              </div>
            ) : null}
          </div>
          <label className="topbar-select branch-button">
            <Icon name="store" />
            <select onChange={(event) => {
              const value = event.target.value as typeof branch;
              setBranch(value);
              void refresh({ branchValue: value });
              setStatus(`${branchOptions.find((option) => option.value === value)?.label ?? value} selecionada`);
            }} value={branch}>
              {branchOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
            </select>
            <Icon name="chevron" />
          </label>
        </header>

        <div className="dashboard-frame">
          <section className="manager-view source-view">
            {activeNav === "dashboard" ? (
              <DashboardScreen dashboard={dashboard} lowStock={lowStock} onSelectNav={selectNav} recentSales={recentSales} topProducts={topProducts} />
            ) : activeNav === "financeiro" ? (
              <FinanceScreen managerData={managerData} onCreatePayable={createPayable} onPayPayable={payPayable} onReconcile={reconcile} onSettleReceivable={settleReceivable} />
            ) : activeNav === "produtos" ? (
              <ProductsScreen onArchiveProduct={archiveProduct} onSaveProduct={saveProduct} onToggleProduct={toggleProduct} products={products} />
            ) : activeNav === "estoque" ? (
              <InventoryScreen managerData={managerData} onAdjustStock={adjustStock} products={products} />
            ) : activeNav === "vendas" ? (
              <SalesScreen dashboard={dashboard} onAction={setStatus} recentSales={recentSales} />
            ) : activeNav === "fornecedores" ? (
              <SuppliersScreen onSaveSupplier={saveSupplier} suppliers={managerData.suppliers} />
            ) : activeNav === "compras" ? (
              <PurchasesScreen onCreatePurchase={createPurchase} onReceivePurchase={receivePurchase} products={products} purchases={managerData.purchases} suppliers={managerData.suppliers} />
            ) : activeNav === "relatorios" ? (
              <ReportsScreen dashboard={dashboard} onCreateReport={createReportExport} products={products} reportExports={managerData.reportExports} />
            ) : activeNav === "funcionarios" ? (
              <EmployeesScreen />
            ) : (
              <SettingsScreen onReset={() => setStatus("Reset de dados bloqueado no Manager conectado")} />
            )}
          </section>

          {showPhone ? (
            <aside className="phone-column" ref={phoneRef}>
              <PhonePreview
                loadingProducts={loading && products.length === 0}
                navigationOpen={mobileMenuOpen}
                onClose={() => { setShowPhone(false); setMobileOrderOpen(false); }}
                onOpenNavigation={() => setMobileMenuOpen((current) => !current)}
                onSaleComplete={() => void refresh()}
                products={products}
              />
            </aside>
          ) : null}
        </div>

        <p className={loading ? "status-line loading" : "status-line"}>{status}</p>
        <span className="audit-sr">{audit[0]?.action ?? "Sem eventos recentes"}</span>
      </section>
    </main>
  );
}
