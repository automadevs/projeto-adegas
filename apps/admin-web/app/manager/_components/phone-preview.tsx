import { useEffect, useMemo, useState } from "react";

import { loadOperationalTickets, publishOperationalOrder, subscribeOperationalSounds, subscribeOperationalTickets, updateOperationalTicket, type OperationalTicket } from "../../_lib/operational-queue";
import { productSkeletonSlots } from "../_lib/constants";
import { api } from "../_lib/api";
import { formatMoney, normalize, paymentLabel, shortProductName } from "../_lib/format";
import type { CartLine, Product, SaleResult } from "../_lib/types";
import { Icon } from "./icons";
import { ProductThumb, StockChip, stockClass } from "./product-thumb";

type PreviewTab = "tables" | "sale" | "orders" | "prep" | "sales";

const tableOptions = ["Balcao", "Mesa 01", "Mesa 02", "Mesa 03", "Mesa 04", "Mesa 05", "Mesa 06", "Mesa 07", "Mesa 08"] as const;

const preferredCategories = [
  "Drinks",
  "Combos",
  "Doses",
  "Espetos",
  "Porcoes de carne",
  "Peixes",
  "Chapas",
  "Cervejas 600ml",
  "Refrigerantes"
];

export function PhonePreview({
  loadingProducts,
  navigationOpen,
  onClose,
  onOpenNavigation,
  onSaleComplete,
  products
}: {
  readonly loadingProducts: boolean;
  readonly navigationOpen: boolean;
  readonly onClose: () => void;
  readonly onOpenNavigation: () => void;
  readonly onSaleComplete: () => void;
  readonly products: readonly Product[];
}) {
  const [activePreviewTab, setActivePreviewTab] = useState<PreviewTab>("tables");
  const [selectedTable, setSelectedTable] = useState<(typeof tableOptions)[number]>("Balcao");
  const [cartsByTable, setCartsByTable] = useState<Record<string, CartLine[]>>({});
  const [cartExpanded, setCartExpanded] = useState(false);
  const [categoryDrawerOpen, setCategoryDrawerOpen] = useState(false);
  const [lastSale, setLastSale] = useState<SaleResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [previewMessage, setPreviewMessage] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("Todos");
  const [search, setSearch] = useState("");
  const [tickets, setTickets] = useState<OperationalTicket[]>(() => loadOperationalTickets());

  useEffect(() => subscribeOperationalTickets(setTickets), []);
  useEffect(() => subscribeOperationalSounds((eventType) => {
    if (eventType !== "ready-ticket") return;
    const context = typeof window !== "undefined" ? new AudioContext() : null;
    if (!context) return;
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.type = "sine";
    oscillator.frequency.value = 1046.5;
    gain.gain.value = 0.04;
    oscillator.connect(gain);
    gain.connect(context.destination);
    oscillator.start();
    gain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + 0.14);
    oscillator.stop(context.currentTime + 0.15);
    void context.close();
  }), []);

  const categoryOptions = useMemo(() => {
    const categories = Array.from(new Set(products.map((product) => product.category).filter(Boolean))).sort((a, b) => a.localeCompare(b, "pt-BR"));
    const pinned = preferredCategories.filter((category) => categories.includes(category));
    const remaining = categories.filter((category) => !pinned.includes(category));
    return ["Todos", ...pinned, ...remaining];
  }, [products]);
  const activeCategory = categoryOptions.includes(categoryFilter) ? categoryFilter : "Todos";
  const visibleProducts = products.slice().sort((a, b) => a.name.localeCompare(b.name, "pt-BR")).filter((product) => {
    const query = normalize(search);
    const matchesCategory = activeCategory === "Todos" || product.category === activeCategory;
    return matchesCategory && (normalize(product.name).includes(query) || normalize(product.sku).includes(query));
  }).slice(0, 9);

  const cart = cartsByTable[selectedTable] ?? [];
  const totalCents = cart.reduce((sum, line) => sum + Number(line.product.salePriceCents) * line.quantity, 0);
  const phoneOrders = useMemo(() => {
    return tickets.map((ticket) => ({
      customer: ticket.customer,
      id: ticket.orderId.slice(0, 8),
      items: ticket.items.reduce((sum, item) => sum + item.quantity, 0),
      sector: ticket.sector === "bar" ? "Bar" : "Cozinha",
      status: ticket.status,
      ticketId: ticket.id,
      title: ticket.items.map((item) => `${item.quantity}x ${item.name}`).join(", "),
      totalCents: ticket.totalCents
    })).slice(0, 8);
  }, [tickets]);
  const completedSales = useMemo(() => [
    ...(lastSale ? [{ id: lastSale.orderId, method: lastSale.paymentMethod, totalCents: lastSale.totalCents }] : []),
    ...phoneOrders.slice(0, 3).map((order) => ({ id: order.id, method: "pix", totalCents: order.totalCents }))
  ], [lastSale, phoneOrders]);

  function addProduct(product: Product): void {
    if (product.stockStatus === "zero" || Number(product.stockOnHand) <= 0) {
      setPreviewMessage("Produto indisponivel");
      return;
    }
    setLastSale(null);
    setPreviewMessage("");
    setActivePreviewTab("sale");
    setCartExpanded(false);
    setCartsByTable((currentByTable) => {
      const current = currentByTable[selectedTable] ?? [];
      const existing = current.find((line) => line.product.id === product.id);
      const next = !existing
        ? [...current, { product, quantity: 1 }]
        : existing.quantity >= Number(product.stockOnHand)
          ? current
          : current.map((line) => line.product.id === product.id ? { ...line, quantity: line.quantity + 1 } : line);
      return { ...currentByTable, [selectedTable]: next };
    });
  }

  function removeProduct(productId: string): void {
    setPreviewMessage("");
    setCartsByTable((currentByTable) => ({
      ...currentByTable,
      [selectedTable]: (currentByTable[selectedTable] ?? []).map((line) => line.product.id === productId ? { ...line, quantity: line.quantity - 1 } : line).filter((line) => line.quantity > 0)
    }));
  }

  async function finalizeSale(): Promise<void> {
    if (cart.length === 0) {
      setPreviewMessage("Carrinho vazio");
      return;
    }
    setLoading(true);
    setPreviewMessage("");
    try {
      const result = await api<SaleResult>("/sales/finalize", {
        method: "POST",
        headers: { "idempotency-key": crypto.randomUUID() },
        body: JSON.stringify({
          items: cart.map((line) => ({ itemId: line.product.id, quantity: line.quantity })),
          payment: { amountCents: totalCents, method: "pix" }
        })
      });
      publishOperationalOrder({
        customer: selectedTable,
        lines: cart.map((line) => ({
          category: line.product.category,
          name: line.product.name,
          quantity: line.quantity
        })),
        orderId: result.orderId,
        totalCents: result.totalCents
      });
      setLastSale(result);
      setCartsByTable((current) => ({ ...current, [selectedTable]: [] }));
      setCartExpanded(false);
      onSaleComplete();
    } catch {
      setPreviewMessage("Sem conexao: venda mantida");
    } finally {
      setLoading(false);
    }
  }

  function cancelCart(): void {
    setCartsByTable((current) => ({ ...current, [selectedTable]: [] }));
    setCartExpanded(false);
    setPreviewMessage("");
    setLastSale(null);
  }

  return (
    <div className="phone-shell" id="phone-preview">
      <header className="phone-header">
        <button className="phone-nav-toggle" onClick={onOpenNavigation} type="button"><Icon name={navigationOpen ? "close" : "menu"} /></button>
        <strong>Venda rapida</strong>
        <button onClick={() => { setCartsByTable((current) => ({ ...current, [selectedTable]: [] })); setCartExpanded(false); }} type="button"><Icon name="trash" /></button>
        <button onClick={onClose} type="button"><Icon name="close" /></button>
      </header>
      {activePreviewTab === "tables" ? (
        <section className="phone-list-view">
          <h3>Mesas</h3>
          <div className="phone-table-grid">
            {tableOptions.map((table) => {
              const lines = cartsByTable[table] ?? [];
              const tableTotal = lines.reduce((sum, line) => sum + Number(line.product.salePriceCents) * line.quantity, 0);
              return (
                <button className={selectedTable === table ? "phone-table-tile active" : "phone-table-tile"} key={table} onClick={() => { setSelectedTable(table); setActivePreviewTab("sale"); setCartExpanded(false); }} type="button">
                  <strong>{table}</strong>
                  <span>{lines.length > 0 ? `${lines.length} item(ns)` : "Livre"}</span>
                  <b>{tableTotal > 0 ? formatMoney(tableTotal) : "Abrir"}</b>
                </button>
              );
            })}
          </div>
        </section>
      ) : activePreviewTab === "sale" ? (
        <>
          <div className="phone-search no-scanner">
            <Icon name="search" />
            <input onChange={(event) => setSearch(event.target.value)} placeholder="Buscar produto" value={search} />
            <button className="phone-filter-button" onClick={() => setCategoryDrawerOpen(true)} type="button"><Icon name="grid" /></button>
          </div>
          {categoryDrawerOpen ? (
            <aside className="phone-category-drawer">
              <header><strong>Categorias</strong><button onClick={() => setCategoryDrawerOpen(false)} type="button"><Icon name="close" /></button></header>
              {categoryOptions.map((category) => (
                <button className={activeCategory === category ? "active" : ""} key={category} onClick={() => { setCategoryFilter(category); setCategoryDrawerOpen(false); }} type="button">
                  {category}
                </button>
              ))}
            </aside>
          ) : null}
          <section className="quick-add">
            <h3>{selectedTable}</h3>
            <div className="quick-grid">
              {loadingProducts ? productSkeletonSlots.map((slot) => (
                <span className="quick-product quick-product-skeleton" key={slot}>
                  <span className="skeleton-thumb" />
                  <span className="skeleton-line wide" />
                  <span className="skeleton-line" />
                </span>
              )) : visibleProducts.length === 0 ? (
                <p className="phone-empty quick-empty">Sem produtos</p>
              ) : visibleProducts.map((product) => (
                <button className={`quick-product ${stockClass(product)} ${product.primaryImage ? "" : "no-media"}`} disabled={product.stockStatus === "zero" || Number(product.stockOnHand) <= 0} key={product.id} onClick={() => addProduct(product)} type="button">
                  {product.primaryImage ? <ProductThumb large product={product} /> : null}
                  <strong>{shortProductName(product.name)}</strong>
                  <span>{formatMoney(product.salePriceCents)}</span>
                  <StockChip product={product} />
                </button>
              ))}
            </div>
          </section>
          {cart.length > 0 ? (
            <section className={cartExpanded ? "phone-cart expanded" : "phone-cart compact"}>
              <h3>Carrinho <span>{cart.length}</span></h3>
              {!cartExpanded ? (
                <div className="phone-cart-preview">
                  <strong>{cart[0]?.quantity}x {cart[0]?.product.name}</strong>
                  <span>{cart.length > 1 ? `${cart.length - 1} item(ns) adicional(is)` : "Produto selecionado"}</span>
                  <b>{formatMoney(totalCents)}</b>
                  <button onClick={() => setCartExpanded(true)} type="button">Mostrar itens no carrinho</button>
                </div>
              ) : (
                <>
                  <div className="phone-cart-lines">
                    {cart.map((line) => (
                      <div className="phone-cart-line" key={line.product.id}>
                        <div><strong>{line.quantity}x {line.product.name}</strong><span>{formatMoney(line.product.salePriceCents)} cada</span></div>
                        <button onClick={() => removeProduct(line.product.id)} type="button"><Icon name="close" /></button>
                      </div>
                    ))}
                  </div>
                  <div className="totals">
                    <span>Subtotal <strong>{formatMoney(totalCents)}</strong></span>
                    <span>Desconto <strong>R$ 0,00</strong></span>
                    <b>Total <strong>{formatMoney(totalCents)}</strong></b>
                  </div>
                  <div className="phone-confirm-actions">
                    <button className="cancel-phone" onClick={cancelCart} type="button">Cancelar</button>
                    <button className="finish-phone" disabled={loading} onClick={() => void finalizeSale()} type="button">{loading ? "Finalizando..." : "Finalizar"}</button>
                  </div>
                </>
              )}
            </section>
          ) : null}
        </>
      ) : activePreviewTab === "orders" ? (
        <section className="phone-list-view">
          <h3>Pedidos</h3>
          {phoneOrders.map((order) => (
            <article className="phone-order-card" key={order.id}>
              <div><strong>{order.id}</strong><span>{order.customer} - {order.items} item(ns)</span></div>
              <em>{order.status === "novo" ? "Novo" : order.status === "recebido" ? "Recebido" : "Pronto"}</em>
              <p>{order.title}</p>
              <b>{formatMoney(order.totalCents)}</b>
            </article>
          ))}
        </section>
      ) : activePreviewTab === "prep" ? (
        <section className="phone-list-view">
          <h3>Preparo</h3>
          {phoneOrders.map((order) => (
            <article className="phone-order-card" key={order.id}>
              <div><strong>{order.sector}</strong><span>{order.id} - {order.customer}</span></div>
              <p>{order.title}</p>
              <div className="prep-actions">
                <button disabled={order.status !== "novo"} onClick={() => updateOperationalTicket(order.ticketId, "recebido")} type="button">Receber</button>
                <button disabled={order.status === "pronto"} onClick={() => updateOperationalTicket(order.ticketId, "pronto")} type="button">Pronto</button>
              </div>
            </article>
          ))}
        </section>
      ) : (
        <section className="phone-list-view">
          <h3>Vendas</h3>
          {completedSales.map((sale) => (
            <article className="phone-order-card" key={sale.id}>
              <div><strong>#{sale.id.slice(0, 8)}</strong><span>{paymentLabel(sale.method)}</span></div>
              <b>{formatMoney(sale.totalCents)}</b>
              <em>Concluida</em>
            </article>
          ))}
        </section>
      )}
      {lastSale ? <p className="sale-ok">Venda #{lastSale.orderId.slice(0, 6)} concluida</p> : previewMessage ? <p className="sale-ok muted">{previewMessage}</p> : null}
      <nav className="phone-bottom">
        <button className={activePreviewTab === "tables" ? "active" : ""} onClick={() => setActivePreviewTab("tables")} type="button"><Icon name="grid" /><span>Mesas</span></button>
        <button className={activePreviewTab === "sale" ? "active" : ""} onClick={() => setActivePreviewTab("sale")} type="button"><Icon name="home" /><span>Venda</span></button>
        <button className={activePreviewTab === "orders" ? "active" : ""} onClick={() => setActivePreviewTab("orders")} type="button"><Icon name="receipt" /><span>Pedidos</span></button>
        <button className={activePreviewTab === "prep" ? "active" : ""} onClick={() => setActivePreviewTab("prep")} type="button"><Icon name="truck" /><span>Preparo</span></button>
        <button className={activePreviewTab === "sales" ? "active" : ""} onClick={() => setActivePreviewTab("sales")} type="button"><Icon name="cart" /><span>Vendas</span></button>
      </nav>
    </div>
  );
}
