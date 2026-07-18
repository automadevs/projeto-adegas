"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3000/api/v1";

interface Product {
  readonly id: string;
  readonly name: string;
  readonly sku: string;
  readonly salePriceCents: string;
  readonly stockOnHand: string;
  readonly stockStatus: "normal" | "low" | "zero";
  readonly primaryImage?: ProductImage | null;
}

interface ProductImage {
  readonly url: string;
  readonly altText: string;
  readonly width: number;
  readonly height: number;
  readonly status: string;
}

interface CartLine {
  readonly product: Product;
  readonly quantity: number;
}

interface SaleResult {
  readonly orderId: string;
  readonly totalCents: string;
  readonly grossProfitCents: string;
  readonly paymentMethod: string;
}

interface ApiOrder {
  readonly id: string;
  readonly type: string;
  readonly status: string;
  readonly tableId: string | null;
  readonly totalCents: string;
  readonly items: readonly { readonly quantity: string }[];
  readonly openedAt: string;
}

interface ApiTable {
  readonly id: string;
  readonly name: string;
  readonly status: string;
  readonly active: boolean;
}

interface ApiPrepTicket {
  readonly id: string;
  readonly stationName: string;
  readonly orderId: string;
  readonly status: string;
  readonly receivedAt: string;
  readonly items: readonly {
    readonly productName: string;
    readonly quantity: string;
    readonly note: string | null;
  }[];
}

interface ApiSale {
  readonly orderId: string;
  readonly status: string;
  readonly totalCents: string;
  readonly grossProfitCents: string;
  readonly paymentMethod: string;
  readonly completedAt?: string;
}

interface OfflineCommand {
  readonly clientCommandId: string;
  readonly commandType: string;
  readonly createdAt: string;
  readonly payload: Record<string, unknown>;
}

interface LocalOrder {
  readonly id: string;
  readonly items: number;
  readonly payment: string;
  readonly status: "Aberta" | "Pago" | "Pendente sync";
  readonly table: string;
  readonly totalCents: number;
  readonly updatedAt: string;
}

interface TableCommand {
  readonly id: string;
  readonly label: string;
  readonly status: "Livre" | "Aberta" | "Fechamento";
  readonly totalCents: number;
}

interface PrepTicket {
  readonly id: string;
  readonly meta: string;
  readonly minutes: number;
  readonly status: "Novo" | "Em preparo" | "Pronto";
  readonly title: string;
}

type OrderTab = "sale" | "orders" | "tables" | "prep" | "sales" | "offline";

const OFFLINE_QUEUE_KEY = "adegaos-order-offline-queue-v1";

const initialOrders: readonly LocalOrder[] = [
  { id: "local-1024", items: 3, payment: "Pix", status: "Pago", table: "Balcão", totalCents: 10297, updatedAt: "14:33" },
  { id: "cmd-07", items: 5, payment: "A receber", status: "Aberta", table: "Mesa 07", totalCents: 18640, updatedAt: "14:20" }
];

const initialTables: readonly TableCommand[] = [
  { id: "mesa-01", label: "Mesa 01", status: "Livre", totalCents: 0 },
  { id: "mesa-04", label: "Mesa 04", status: "Aberta", totalCents: 7460 },
  { id: "mesa-07", label: "Mesa 07", status: "Fechamento", totalCents: 18640 },
  { id: "balcao", label: "Balcão", status: "Aberta", totalCents: 3290 }
];

const initialPrepQueue: readonly PrepTicket[] = [
  { id: "prep-1", meta: "Mesa 04", minutes: 4, status: "Novo", title: "Separar 2 long necks" },
  { id: "prep-2", meta: "Mesa 07", minutes: 9, status: "Em preparo", title: "Conferir whisky e gelo" }
];

const tabs: readonly { id: OrderTab; icon: IconName; label: string; title: string }[] = [
  { id: "sale", icon: "home", label: "Venda", title: "Venda rápida" },
  { id: "orders", icon: "receipt", label: "Pedidos", title: "Pedidos" },
  { id: "tables", icon: "table", label: "Mesas", title: "Mesas e comandas" },
  { id: "prep", icon: "clock", label: "Preparo", title: "Preparo" },
  { id: "sales", icon: "cart", label: "Vendas", title: "Vendas recentes" },
  { id: "offline", icon: "wifi", label: "Offline", title: "Offline" }
];

const orderRoutes: Record<OrderTab, string> = {
  offline: "/order/sync",
  orders: "/order/orders",
  prep: "/order/station",
  sale: "/order/home",
  sales: "/order/sales",
  tables: "/order/tables"
};

const productSkeletonSlots = [0, 1, 2, 3, 4, 5, 6, 7, 8] as const;

export default function AttendantHome() {
  const pathname = usePathname();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<OrderTab>(() => orderTabFromPath(pathname));
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartLine[]>([]);
  const [cartExpanded, setCartExpanded] = useState(false);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("Carregando produtos");
  const [loading, setLoading] = useState(false);
  const [lastSale, setLastSale] = useState<SaleResult | null>(null);
  const [orders, setOrders] = useState<LocalOrder[]>([...initialOrders]);
  const [tables, setTables] = useState<TableCommand[]>([...initialTables]);
  const [prepQueue, setPrepQueue] = useState<PrepTicket[]>([...initialPrepQueue]);
  const [recentSales, setRecentSales] = useState<ApiSale[]>([]);
  const [offlineCommands, setOfflineCommands] = useState<OfflineCommand[]>(() => loadOfflineCommands());

  async function refreshProducts(): Promise<void> {
    try {
      const [items, apiTables, apiOrders, apiTickets, apiSales] = await Promise.all([
        api<Product[]>("/products/catalog"),
        api<ApiTable[]>("/order/tables"),
        api<ApiOrder[]>("/orders"),
        api<ApiPrepTicket[]>("/preparation/tickets"),
        api<ApiSale[]>("/sales")
      ]);
      setProducts(items);
      setTables(apiTables.map(toTableCommand));
      setOrders(apiOrders.map(toLocalOrder));
      setPrepQueue(apiTickets.map(toPrepTicket));
      setRecentSales(apiSales);
      setStatus("Online");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Falha de conexão");
    }
  }

  useEffect(() => {
    void refreshProducts();
  }, []);

  useEffect(() => {
    if (!("serviceWorker" in navigator)) {
      return;
    }

    void navigator.serviceWorker.register("/sw.js").catch(() => undefined);
  }, []);

  useEffect(() => {
    setActiveTab(orderTabFromPath(pathname));
  }, [pathname]);

  useEffect(() => {
    saveOfflineCommands(offlineCommands);
  }, [offlineCommands]);

  const visibleProducts = useMemo(() => {
    const query = search.toLowerCase();
    return products
      .filter((product) => product.name.toLowerCase().includes(query) || product.sku.toLowerCase().includes(query))
      .slice(0, 9);
  }, [products, search]);

  const totalCents = useMemo(
    () => cart.reduce((sum, line) => sum + Number(line.product.salePriceCents) * line.quantity, 0),
    [cart]
  );

  const activeTitle = tabs.find((tab) => tab.id === activeTab)?.title ?? "AdegaOS Order";
  const loadingProducts = status === "Carregando produtos" && products.length === 0;

  function selectTab(tab: OrderTab): void {
    setActiveTab(tab);
    router.push(orderRoutes[tab]);
  }

  function enqueueOffline(commandType: string, payload: Record<string, unknown>): void {
    setOfflineCommands((current) => [
      {
        clientCommandId: `offline-${Date.now()}-${current.length + 1}`,
        commandType,
        createdAt: new Date().toISOString(),
        payload
      },
      ...current
    ].slice(0, 100));
  }

  function addToCart(product: Product): void {
    if (product.stockStatus === "zero" || Number(product.stockOnHand) <= 0) {
      setStatus("Produto indisponivel");
      return;
    }

    setLastSale(null);
    setCartExpanded(false);
    setCart((current) => {
      const existing = current.find((line) => line.product.id === product.id);
      if (!existing) {
        return [...current, { product, quantity: 1 }];
      }

      if (existing.quantity >= Number(product.stockOnHand)) {
        setStatus("Estoque insuficiente");
        return current;
      }

      return current.map((line) =>
        line.product.id === product.id ? { ...line, quantity: line.quantity + 1 } : line
      );
    });
  }

  function decrement(productId: string): void {
    setCart((current) =>
      current
        .map((line) => line.product.id === productId ? { ...line, quantity: line.quantity - 1 } : line)
        .filter((line) => line.quantity > 0)
    );
  }

  function registerLocalOrder(kind: LocalOrder["status"], payment: string, orderId: string): void {
    const itemCount = cart.reduce((sum, line) => sum + line.quantity, 0);
    const order: LocalOrder = {
      id: orderId,
      items: itemCount,
      payment,
      status: kind,
      table: "Balcão",
      totalCents,
      updatedAt: formatTime(new Date())
    };
    const prepTicket: PrepTicket = {
      id: `prep-${orderId}`,
      meta: order.table,
      minutes: 0,
      status: "Novo",
      title: `Separar ${itemCount} item(ns)`
    };

    setOrders((current) => [order, ...current].slice(0, 12));
    setPrepQueue((current) => [prepTicket, ...current].slice(0, 12));
  }

  async function finalizeSale(): Promise<void> {
    if (cart.length === 0) {
      return;
    }

    setLoading(true);
    try {
      const result = await api<SaleResult>("/sales/finalize", {
        method: "POST",
        headers: { "idempotency-key": crypto.randomUUID() },
        body: JSON.stringify({
          items: cart.map((line) => ({
            itemId: line.product.id,
            quantity: line.quantity
          })),
          payment: {
            method: "pix",
            amountCents: totalCents
          }
        })
      });
      registerLocalOrder("Pago", "Pix", result.orderId);
      setLastSale(result);
      setCart([]);
      setCartExpanded(false);
      setStatus("Venda finalizada");
      await refreshProducts();
    } catch {
      const localId = `offline-${Date.now()}`;
      registerLocalOrder("Pendente sync", "Pix pendente", localId);
      enqueueOffline("sale.finalize", {
        localId,
        items: cart.map((line) => ({ itemId: line.product.id, quantity: line.quantity })),
        payment: { amountCents: totalCents, method: "pix" }
      });
      setCart([]);
      setCartExpanded(false);
      setStatus("Sem conexão: venda salva para sincronizar");
      selectTab("offline");
    } finally {
      setLoading(false);
    }
  }

  function cancelCart(): void {
    setCart([]);
    setCartExpanded(false);
    setLastSale(null);
    setStatus("Carrinho limpo");
  }

  async function openTable(tableId: string): Promise<void> {
    try {
      await api<ApiOrder>("/orders", {
        method: "POST",
        headers: { "idempotency-key": crypto.randomUUID() },
        body: JSON.stringify({ type: "TABLE", tableId })
      });
      await refreshProducts();
      setStatus("Comanda aberta");
    } catch {
      setTables((current) =>
        current.map((table) =>
          table.id === tableId ? { ...table, status: "Aberta", totalCents: table.totalCents || 0 } : table
        )
      );
      enqueueOffline("table.open", { tableId });
      setStatus("Sem conexão: comanda salva localmente");
    }
  }

  function advancePrep(ticketId: string): void {
    setPrepQueue((current) =>
      current.map((ticket) => {
        if (ticket.id !== ticketId) {
          return ticket;
        }

        if (ticket.status === "Novo") {
          return { ...ticket, status: "Em preparo" };
        }

        if (ticket.status === "Em preparo") {
          return { ...ticket, status: "Pronto" };
        }

        return ticket;
      })
    );
  }

  async function syncOffline(): Promise<void> {
    setLoading(true);
    try {
      for (const command of offlineCommands) {
        await api("/sync/commands", {
          method: "POST",
          body: JSON.stringify({
            clientCommandId: command.clientCommandId,
            commandType: command.commandType,
            deviceId: "attendant-pwa",
            payload: command.payload
          })
        });
      }
      await refreshProducts();
      setOfflineCommands([]);
      setStatus("Sincronização concluída");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Sincronização falhou");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="screen">
      <header className="sale-header">
        <button aria-label="Menu" onClick={() => selectTab("offline")} type="button">
          <Icon name="menu" />
        </button>
        <strong>{activeTitle}</strong>
        <button
          aria-label={activeTab === "sale" ? "Limpar carrinho" : "Atualizar"}
          onClick={activeTab === "sale" ? () => setCart([]) : () => void refreshProducts()}
          type="button"
        >
          <Icon name={activeTab === "sale" ? "trash" : "refresh"} />
        </button>
      </header>

      <section className="order-content" aria-live="polite">
        {activeTab === "sale" ? (
          <QuickSaleView
            addToCart={addToCart}
            cart={cart}
            cartExpanded={cartExpanded}
            cancelCart={cancelCart}
            decrement={decrement}
            finalizeSale={() => void finalizeSale()}
            lastSale={lastSale}
            loading={loading}
            loadingProducts={loadingProducts}
            products={visibleProducts}
            search={search}
            setCartExpanded={setCartExpanded}
            setSearch={setSearch}
            status={status}
            totalCents={totalCents}
          />
        ) : null}

        {activeTab === "orders" ? (
          <OrdersView orders={orders} onAction={(message) => setStatus(message)} />
        ) : null}

        {activeTab === "tables" ? (
          <TablesView onOpenTable={openTable} tables={tables} />
        ) : null}

        {activeTab === "prep" ? (
          <PrepView onAdvance={advancePrep} tickets={prepQueue} />
        ) : null}

        {activeTab === "sales" ? (
          <SalesView sales={recentSales} />
        ) : null}

        {activeTab === "offline" ? (
          <OfflineView loading={loading} offlineQueue={offlineCommands.length} onSync={() => void syncOffline()} status={status} />
        ) : null}
      </section>

      <nav className="bottom-nav" aria-label="Navegação do AdegaOS Order">
        {tabs.map((tab) => (
          <button className={activeTab === tab.id ? "active" : ""} key={tab.id} onClick={() => selectTab(tab.id)} type="button">
            <Icon name={tab.icon} />
            <span>{tab.label}</span>
          </button>
        ))}
      </nav>
    </main>
  );
}

function QuickSaleView({
  addToCart,
  cart,
  cartExpanded,
  cancelCart,
  decrement,
  finalizeSale,
  lastSale,
  loading,
  loadingProducts,
  products,
  search,
  setCartExpanded,
  setSearch,
  status,
  totalCents
}: {
  readonly addToCart: (product: Product) => void;
  readonly cart: readonly CartLine[];
  readonly cartExpanded: boolean;
  readonly cancelCart: () => void;
  readonly decrement: (productId: string) => void;
  readonly finalizeSale: () => void;
  readonly lastSale: SaleResult | null;
  readonly loading: boolean;
  readonly loadingProducts: boolean;
  readonly products: readonly Product[];
  readonly search: string;
  readonly setCartExpanded: (expanded: boolean) => void;
  readonly setSearch: (value: string) => void;
  readonly status: string;
  readonly totalCents: number;
}) {
  const neutralStatus = status === "Online" || status === "Carregando produtos";
  const emptyProductsText = status === "Carregando produtos"
    ? "Carregando produtos."
    : "Sem produtos com estoque disponível.";

  return (
    <div className="sale-view">
      <section className="search-bar" aria-label="Busca de produto">
        <Icon name="search" />
        <input
          aria-label="Buscar produto"
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Buscar produto"
          value={search}
        />
      </section>

      <section className="quick-add" aria-label="Adicionar rápido">
        <h1>Adicionar rápido</h1>
        <div className={loadingProducts ? "quick-grid loading" : "quick-grid"}>
          {loadingProducts ? (
            productSkeletonSlots.map((slot) => (
              <span aria-hidden="true" className="product-card product-card-skeleton" key={slot}>
                <span className="skeleton-thumb" />
                <span className="skeleton-line wide" />
                <span className="skeleton-line" />
              </span>
            ))
          ) : products.length === 0 ? (
            <p className="empty">{emptyProductsText}</p>
          ) : (
            products.map((product) => (
              <button
                className={`product-card ${stockClass(product)} ${product.primaryImage ? "" : "no-media"}`}
                disabled={product.stockStatus === "zero" || Number(product.stockOnHand) <= 0}
                key={product.id}
                onClick={() => addToCart(product)}
                type="button"
              >
                <ProductThumb product={product} />
                <strong>{shortProductName(product.name)}</strong>
                <span>{formatMoney(product.salePriceCents)}</span>
                <StockChip product={product} />
              </button>
            ))
          )}
        </div>
      </section>

      {cart.length > 0 ? (
        <section className={cartExpanded ? "cart expanded" : "cart compact"} aria-label="Carrinho">
          <h2>
            Carrinho
            <span>{cart.length}</span>
          </h2>
          {!cartExpanded ? (
            <div className="cart-preview">
              <strong>{cart[0]?.quantity}x {cart[0]?.product.name}</strong>
              <span>{cart.length > 1 ? `${cart.length - 1} item(ns) adicional(is)` : "Produto selecionado"}</span>
              <b>{formatMoney(totalCents)}</b>
              <button onClick={() => setCartExpanded(true)} type="button">Mostrar itens no carrinho</button>
            </div>
          ) : (
            <>
              <div className="cart-lines">
                {cart.map((line) => (
                  <div className="cart-line" key={line.product.id}>
                    <div>
                      <strong>{line.quantity}x {line.product.name}</strong>
                      <span>{formatMoney(line.product.salePriceCents)} cada</span>
                    </div>
                    <button className="remove-line" aria-label={`Remover ${line.product.name}`} onClick={() => decrement(line.product.id)} type="button">
                      <Icon name="close" />
                    </button>
                  </div>
                ))}
              </div>

              <div className="totals">
                <span>Subtotal <strong>{formatMoney(totalCents)}</strong></span>
                <span>Desconto <strong>R$ 0,00</strong></span>
                <b>Total <strong>{formatMoney(totalCents)}</strong></b>
              </div>

              <div className="cart-confirm-actions">
                <button className="cancel" onClick={cancelCart} type="button">Cancelar</button>
                <button className="finish" disabled={loading} onClick={finalizeSale} type="button">
                  {loading ? "Finalizando..." : "Finalizar"}
                </button>
              </div>
            </>
          )}
        </section>
      ) : null}
      {lastSale ? (
        <p className="success floating-status">Venda #{lastSale.orderId.slice(0, 6)} concluida em Pix</p>
      ) : !neutralStatus ? (
        <p className="status floating-status">{status}</p>
      ) : null}
    </div>
  );
}

function OrdersView({ onAction, orders }: { readonly onAction: (message: string) => void; readonly orders: readonly LocalOrder[] }) {
  return (
    <section className="local-view">
      <div className="section-title">
        <h1>Pedidos e comandas</h1>
        <p>Fila local do Order. Sincroniza quando a API dedicada estiver disponível.</p>
      </div>
      <div className="local-list">
        {orders.map((order) => (
          <article className="state-card" key={order.id}>
            <div>
              <strong>{order.table}</strong>
              <span>{order.items} item(ns) · {order.updatedAt}</span>
            </div>
            <b>{formatMoney(order.totalCents)}</b>
            <em className={order.status === "Pendente sync" ? "warning" : ""}>{order.status}</em>
            <button onClick={() => onAction(`Pedido ${order.id} selecionado`)} type="button">Abrir</button>
          </article>
        ))}
      </div>
    </section>
  );
}

function TablesView({ onOpenTable, tables }: { readonly onOpenTable: (tableId: string) => void | Promise<void>; readonly tables: readonly TableCommand[] }) {
  return (
    <section className="local-view">
      <div className="section-title">
        <h1>Mesas e comandas</h1>
        <p>Controle local para abrir comanda, acompanhar consumo e preparar fechamento.</p>
      </div>
      <div className="tile-grid">
        {tables.map((table) => (
          <button className={`table-tile ${table.status.toLowerCase().replace(" ", "-")}`} key={table.id} onClick={() => void onOpenTable(table.id)} type="button">
            <strong>{table.label}</strong>
            <span>{table.status}</span>
            <b>{table.totalCents > 0 ? formatMoney(table.totalCents) : "Livre"}</b>
          </button>
        ))}
      </div>
    </section>
  );
}

function PrepView({ onAdvance, tickets }: { readonly onAdvance: (ticketId: string) => void; readonly tickets: readonly PrepTicket[] }) {
  return (
    <section className="local-view">
      <div className="section-title">
        <h1>Preparo</h1>
        <p>Fila local para separação e conferência dos pedidos enviados pelo salão/balcão.</p>
      </div>
      <div className="local-list">
        {tickets.map((ticket) => (
          <article className="state-card" key={ticket.id}>
            <div>
              <strong>{ticket.title}</strong>
              <span>{ticket.meta} · {ticket.minutes} min</span>
            </div>
            <em>{ticket.status}</em>
            <button onClick={() => onAdvance(ticket.id)} type="button">
              {ticket.status === "Pronto" ? "Conferido" : "Avançar"}
            </button>
          </article>
        ))}
      </div>
    </section>
  );
}

function SalesView({ sales }: { readonly sales: readonly ApiSale[] }) {
  return (
    <section className="local-view">
      <div className="section-title">
        <h1>Vendas recentes</h1>
        <p>Vendas finalizadas, pagamento, margem e status sincronizado com o Manager.</p>
      </div>
      <div className="local-list">
        {sales.map((sale) => (
          <article className="state-card" key={sale.orderId}>
            <div>
              <strong>Venda #{sale.orderId.slice(0, 6)}</strong>
              <span>{sale.completedAt ? formatTime(new Date(sale.completedAt)) : "Agora"} · {paymentLabel(sale.paymentMethod)}</span>
            </div>
            <b>{formatMoney(sale.totalCents)}</b>
            <em>{sale.status}</em>
            <button type="button">Detalhes</button>
          </article>
        ))}
        {sales.length === 0 ? (
          <p className="empty">Nenhuma venda sincronizada.</p>
        ) : null}
      </div>
    </section>
  );
}

function OfflineView({
  loading,
  offlineQueue,
  onSync,
  status
}: {
  readonly loading: boolean;
  readonly offlineQueue: number;
  readonly onSync: () => void;
  readonly status: string;
}) {
  return (
    <section className="local-view">
      <div className="section-title">
        <h1>Offline</h1>
        <p>Operação local com fila de sincronização para vendas salvas sem conexão.</p>
      </div>
      <div className="sync-panel">
        <Icon name="wifi" />
        <strong>{offlineQueue} pendência(s)</strong>
        <span>{status}</span>
        <button disabled={loading} onClick={onSync} type="button">Sincronizar agora</button>
      </div>
    </section>
  );
}

function toTableCommand(table: ApiTable): TableCommand {
  return {
    id: table.id,
    label: table.name,
    status:
      table.status === "AVAILABLE"
        ? "Livre"
        : table.status === "OCCUPIED"
          ? "Aberta"
          : "Fechamento",
    totalCents: 0
  };
}

function toLocalOrder(order: ApiOrder): LocalOrder {
  return {
    id: order.id,
    items: order.items.reduce((sum, item) => sum + Number(item.quantity), 0),
    payment: order.status === "COMPLETED" ? "Registrado" : "A receber",
    status:
      order.status === "COMPLETED"
        ? "Pago"
        : order.status === "CANCELLED"
          ? "Pendente sync"
          : "Aberta",
    table: order.type === "TABLE" ? "Mesa" : "Balcão",
    totalCents: Number(order.totalCents),
    updatedAt: formatTime(new Date(order.openedAt))
  };
}

function toPrepTicket(ticket: ApiPrepTicket): PrepTicket {
  const firstItem = ticket.items[0];
  return {
    id: ticket.id,
    meta: ticket.stationName,
    minutes: Math.max(0, Math.floor((Date.now() - new Date(ticket.receivedAt).getTime()) / 60_000)),
    status:
      ticket.status === "READY"
        ? "Pronto"
        : ticket.status === "PREPARING"
          ? "Em preparo"
          : "Novo",
    title: firstItem
      ? `${firstItem.quantity}x ${firstItem.productName}`
      : `Pedido ${ticket.orderId.slice(0, 6)}`
  };
}

function ProductThumb({ product }: { readonly product: Product }) {
  const image = product.primaryImage;
  if (!image) return null;

  return (
    <span className="product-thumb has-image">
      <img
        alt={image.altText}
        height={image.height}
        loading="eager"
        onError={(event) => { event.currentTarget.hidden = true; event.currentTarget.closest(".product-thumb")?.remove(); }}
        src={image.url}
        width={image.width}
      />
    </span>
  );
}

function stockClass(product: Product): string {
  if (product.stockStatus === "zero" || Number(product.stockOnHand) <= 0) {
    return "unavailable";
  }

  if (product.stockStatus === "low") {
    return "low-stock";
  }

  return "available";
}

function stockLabel(product: Product): string {
  if (product.stockStatus === "zero" || Number(product.stockOnHand) <= 0) {
    return "Indisponivel";
  }

  if (product.stockStatus === "low") {
    return "Estoque baixo";
  }

  return "Disponivel";
}

function StockChip({ product }: { readonly product: Product }) {
  return <em className={`stock-chip ${stockClass(product)}`}>{stockLabel(product)}</em>;
}

type IconName = "cart" | "check" | "clock" | "close" | "grid" | "home" | "menu" | "more" | "receipt" | "refresh" | "search" | "table" | "trash" | "wifi";

function Icon({ name }: { readonly name: IconName }) {
  switch (name) {
    case "cart":
      return <svg viewBox="0 0 24 24"><path d="M3 4h2l2.4 11h10.8l2-8H7" /><path d="M9 20h.01M18 20h.01" /></svg>;
    case "check":
      return <svg viewBox="0 0 24 24"><path d="m5 13 4 4L19 7" /></svg>;
    case "clock":
      return <svg viewBox="0 0 24 24"><path d="M12 7v5l3 2" /><path d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z" /></svg>;
    case "close":
      return <svg viewBox="0 0 24 24"><path d="M18 6 6 18M6 6l12 12" /></svg>;
    case "grid":
      return <svg viewBox="0 0 24 24"><path d="M5 5h4v4H5zM15 5h4v4h-4zM5 15h4v4H5zM15 15h4v4h-4z" /></svg>;
    case "home":
      return <svg viewBox="0 0 24 24"><path d="m3 11 9-8 9 8v10H5V11" /></svg>;
    case "menu":
      return <svg viewBox="0 0 24 24"><path d="M4 7h16M4 12h16M4 17h16" /></svg>;
    case "more":
      return <svg viewBox="0 0 24 24"><path d="M5 12h.01M12 12h.01M19 12h.01" /></svg>;
    case "receipt":
      return <svg viewBox="0 0 24 24"><path d="M6 3h12v18l-3-2-3 2-3-2-3 2V3Z" /><path d="M9 8h6M9 12h6M9 16h4" /></svg>;
    case "refresh":
      return <svg viewBox="0 0 24 24"><path d="M20 11a8 8 0 0 0-14.7-4M4 5v5h5M4 13a8 8 0 0 0 14.7 4M20 19v-5h-5" /></svg>;
    case "search":
      return <svg viewBox="0 0 24 24"><path d="m21 21-4.5-4.5M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15Z" /></svg>;
    case "table":
      return <svg viewBox="0 0 24 24"><path d="M4 6h16M4 12h16M4 18h16M7 6v12M17 6v12" /></svg>;
    case "trash":
      return <svg viewBox="0 0 24 24"><path d="M4 7h16M10 11v6M14 11v6M6 7l1 14h10l1-14M9 7V4h6v3" /></svg>;
    case "wifi":
      return <svg viewBox="0 0 24 24"><path d="M5 12.5a10 10 0 0 1 14 0M8.5 16a5 5 0 0 1 7 0M12 20h.01M2 8.5a15 15 0 0 1 20 0" /></svg>;
  }
}

async function api<TResponse>(path: string, init: RequestInit = {}): Promise<TResponse> {
  const headers = new Headers(init.headers);
  headers.set("content-type", "application/json");
  headers.set("accept", "application/json");

  const response = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers
  });

  if (!response.ok) {
    const problem = await response.json().catch(() => null) as { detail?: string; title?: string } | null;
    throw new Error(problem?.detail ?? problem?.title ?? "Erro na API");
  }

  return await response.json() as TResponse;
}

function loadOfflineCommands(): OfflineCommand[] {
  if (typeof window === "undefined") {
    return [];
  }

  const raw = window.localStorage.getItem(OFFLINE_QUEUE_KEY);
  if (!raw) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.filter((command): command is OfflineCommand => (
      typeof command === "object" &&
      command !== null &&
      typeof (command as OfflineCommand).clientCommandId === "string" &&
      typeof (command as OfflineCommand).commandType === "string"
    ));
  } catch {
    return [];
  }
}

function saveOfflineCommands(commands: readonly OfflineCommand[]): void {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(commands));
}

function formatMoney(value: string | number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL"
  }).format(Number(value) / 100);
}

function formatTime(date: Date): string {
  return new Intl.DateTimeFormat("pt-BR", {
    hour: "2-digit",
    minute: "2-digit"
  }).format(date);
}

function paymentLabel(method: string): string {
  if (method === "card") {
    return "Cartao";
  }

  if (method === "cash") {
    return "Dinheiro";
  }

  if (method === "pix") {
    return "Pix";
  }

  return method;
}

function shortProductName(name: string): string {
  return name.length > 18 ? `${name.slice(0, 17)}...` : name;
}

function productKind(name: string): string {
  const lower = name.toLowerCase();
  if (lower.includes("skol")) {
    return "beer skol";
  }

  if (lower.includes("brahma")) {
    return "beer brahma";
  }

  if (lower.includes("heineken")) {
    return "beer heineken";
  }

  if (lower.includes("antarctica")) {
    return "beer antarctica";
  }

  if (lower.includes("johnnie") || lower.includes("whisky")) {
    return "whisky";
  }

  if (lower.includes("red bull") || lower.includes("energ")) {
    return "energy";
  }

  if (lower.includes("coca")) {
    return "cola";
  }

  if (lower.includes("água") || lower.includes("agua")) {
    return "water";
  }

  if (lower.includes("smirnoff")) {
    return "vodka";
  }

  return "beer";
}

function productMark(name: string): string {
  const lower = name.toLowerCase();
  if (lower.includes("skol")) {
    return "SK";
  }

  if (lower.includes("brahma")) {
    return "BR";
  }

  if (lower.includes("heineken")) {
    return "HE";
  }

  if (lower.includes("antarctica")) {
    return "AN";
  }

  if (lower.includes("johnnie") || lower.includes("whisky")) {
    return "JW";
  }

  if (lower.includes("red bull")) {
    return "RB";
  }

  if (lower.includes("tnt") || lower.includes("energ")) {
    return "TN";
  }

  if (lower.includes("coca")) {
    return "CO";
  }

  if (lower.includes("smirnoff")) {
    return "SM";
  }

  if (lower.includes("agua") || lower.includes("Ã¡gua")) {
    return "AG";
  }

  return name.slice(0, 2).toUpperCase();
}

function orderTabFromPath(pathname: string | null): OrderTab {
  if (!pathname) {
    return "sale";
  }

  if (pathname.includes("/order/orders")) {
    return "orders";
  }

  if (pathname.includes("/order/tables")) {
    return "tables";
  }

  if (pathname.includes("/order/station")) {
    return "prep";
  }

  if (pathname.includes("/order/sales")) {
    return "sales";
  }

  if (pathname.includes("/order/sync") || pathname.includes("/order/more")) {
    return "offline";
  }

  return "sale";
}
