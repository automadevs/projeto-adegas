import { randomUUID } from "node:crypto";
import { productImageKeysBySku, productImageViewByKey } from "@adegaos/assets";
import { NextRequest, NextResponse } from "next/server";

type ProductStatus = "normal" | "low" | "zero";

interface ProductImage {
  readonly altText: string;
  readonly height: number;
  readonly status: string;
  readonly url: string;
  readonly width: number;
}

interface Product {
  active: boolean;
  ageRestricted: boolean;
  barcode: string | null;
  category: string;
  costPriceCents: string;
  id: string;
  minStock: string;
  name: string;
  preparationStationId: string | null;
  primaryImage: ProductImage | null;
  salePriceCents: string;
  sku: string;
  stockOnHand: string;
  stockStatus: ProductStatus;
  unit: string;
}

interface Sale {
  completedAt: string;
  items: readonly { productId: string; quantity: number; totalCents: number }[];
  orderId: string;
  paymentMethod: string;
  totalCents: number;
}

interface DemoState {
  audit: { action: string; createdAt: string; id: string }[];
  payables: unknown[];
  products: Product[];
  purchases: unknown[];
  receivables: unknown[];
  reports: unknown[];
  sales: Sale[];
  suppliers: unknown[];
}

type RouteContext = {
  params: Promise<unknown>;
};

async function routePath(context: RouteContext): Promise<string[]> {
  const params = await context.params;
  if (
    typeof params === "object" &&
    params !== null &&
    "path" in params &&
    Array.isArray((params as { path?: unknown }).path)
  ) {
    return (params as { path: string[] }).path;
  }

  return [];
}

function cents(value: number): string {
  return String(value);
}

function isoDate(daysAgo = 0): string {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return date.toISOString().slice(0, 10);
}

function product(
  sku: string,
  name: string,
  category: string,
  unit: string,
  price: number,
  stock: number,
  options: { ageRestricted?: boolean; minStock?: number } = {}
): Product {
  const minStock = options.minStock ?? 6;
  return {
    active: true,
    ageRestricted: options.ageRestricted ?? false,
    barcode: null,
    category,
    costPriceCents: cents(Math.floor(price * 0.55)),
    id: sku.toLowerCase(),
    minStock: cents(minStock),
    name,
    preparationStationId: null,
    primaryImage: imageForSku(sku),
    salePriceCents: cents(price),
    sku,
    stockOnHand: cents(stock),
    stockStatus: stock <= 0 ? "zero" : stock <= minStock ? "low" : "normal",
    unit
  };
}

function imageForSku(sku: string): ProductImage | null {
  if (!Object.prototype.hasOwnProperty.call(productImageKeysBySku, sku)) {
    return null;
  }

  return productImageViewByKey(productImageKeysBySku[sku as keyof typeof productImageKeysBySku], 128);
}

function createProducts(): Product[] {
  return [
    product("MENU-JANTINHA", "Jantinha completa", "Outros", "prato", 1999, 18),
    product("ESP-BOI", "Espeto tradicional de boi", "Outros", "un", 1000, 24),
    product("ESP-MED-FRANGO", "Espeto medalhao de frango", "Outros", "un", 1200, 16),
    product("ESP-QUEIJO", "Espeto queijo coalho", "Outros", "un", 900, 16),
    product("POR-CARNE-SOL-FRITAS-M", "Carne de sol com fritas meia", "Outros", "porcao", 5000, 10),
    product("POR-FRITAS-BACON-M", "Fritas com queijo e bacon meia", "Outros", "porcao", 4000, 10),
    product("PEIXE-TILAPIA-FRITAS-I", "Tilapia com fritas inteira", "Outros", "porcao", 6000, 6),
    product("CHAPA-CHAPAO", "Chapao completo", "Outros", "porcao", 11500, 6),
    product("AGUA-GAS", "Agua com gas", "Aguas", "un", 400, 24),
    product("AGUA-SEM-GAS", "Agua sem gas", "Aguas", "un", 400, 24),
    product("H2O-1L", "H2O 1 Litro", "Aguas", "un", 1200, 0),
    product("CERV-BRAHMA-600", "Brahma 600ml", "Cervejas 600ml", "garrafa", 1100, 24, { ageRestricted: true }),
    product("CERV-SKOL-600", "Skol 600ml", "Cervejas 600ml", "garrafa", 1000, 24, { ageRestricted: true }),
    product("CERV-HEINEKEN-600", "Heineken 600ml", "Cervejas 600ml", "garrafa", 1500, 20, { ageRestricted: true }),
    product("CERV-HEINEKEN-LN", "Heineken Long Neck", "Cervejas Long Neck", "un", 900, 20, { ageRestricted: true }),
    product("REFRI-COCA-LATA", "Coca-Cola lata", "Outros", "un", 600, 20),
    product("REFRI-GUARANA-2L", "Guarana 2 litros", "Outros", "un", 1200, 14),
    product("SUCO-ABACAXI-COPO", "Suco abacaxi copo", "Outros", "copo", 800, 12),
    product("SUCO-ACR-LEITE", "Acrescimo de leite", "Outros", "extra", 200, 0),
    product("DOSE-SMIRNOFF", "Dose Vodka Smirnoff", "Drinks", "dose", 1200, 20, { ageRestricted: true }),
    product("DOSE-RED-LABEL", "Dose Whisky Red Label", "Drinks", "dose", 1500, 18, { ageRestricted: true }),
    product("DOSE-GIN-TANQUERAY", "Dose Gin Tanqueray", "Drinks", "dose", 2000, 14, { ageRestricted: true }),
    product("COMBO-SMIRNOFF", "Combo Vodka Smirnoff com 4 Red Bull", "Drinks", "combo", 10000, 8, { ageRestricted: true }),
    product("COMBO-RED-LABEL", "Combo Whisky Red Label com 4 Red Bull", "Drinks", "combo", 20000, 6, { ageRestricted: true }),
    product("COMBO-GIN-TANQUERAY", "Combo Gin Tanqueray com 4 suco de uva", "Drinks", "combo", 20000, 6, { ageRestricted: true }),
    product("DRINK-CAIPI-MORANGO", "Caipirinha de morango", "Drinks", "copo", 2500, 14, { ageRestricted: true }),
    product("DRINK-CAIPI-LIMAO", "Caipirinha de limao", "Drinks", "copo", 2500, 14, { ageRestricted: true }),
    product("DRINK-CAIPI-KIWI-CREM", "Caipirinha de kiwi cremosa", "Drinks", "copo", 3500, 0, { ageRestricted: true })
  ];
}

function getState(): DemoState {
  const globalState = globalThis as typeof globalThis & { __adegaosAdminDemo?: DemoState };
  if (!globalState.__adegaosAdminDemo) {
    const products = createProducts();
    const now = new Date().toISOString();
    globalState.__adegaosAdminDemo = {
      audit: [{ action: "demo.ready", createdAt: now, id: randomUUID() }],
      payables: [],
      products,
      purchases: [],
      receivables: [],
      reports: [],
      sales: [
        saleFromSkus(products, "pix", `${isoDate()}T14:32:00-03:00`, [
          ["DRINK-CAIPI-MORANGO", 2],
          ["COMBO-SMIRNOFF", 1]
        ]),
        saleFromSkus(products, "card", `${isoDate()}T14:01:00-03:00`, [
          ["MENU-JANTINHA", 3],
          ["CERV-HEINEKEN-600", 2]
        ]),
        saleFromSkus(products, "cash", `${isoDate(1)}T12:36:00-03:00`, [
          ["ESP-BOI", 4],
          ["AGUA-GAS", 4]
        ])
      ],
      suppliers: [
        { active: true, contactName: "Comercial", email: "fornecedor@demo.local", id: "supplier-demo", leadTimeDays: 2, name: "Distribuidora Demo", phone: "(31) 99999-0000", whatsapp: "(31) 99999-0000" }
      ]
    };
  }
  return globalState.__adegaosAdminDemo;
}

function saleFromSkus(products: readonly Product[], paymentMethod: string, completedAt: string, lines: readonly [string, number][]): Sale {
  const items = lines.map(([sku, quantity]) => {
    const productItem = products.find((item) => item.sku === sku);
    const totalCents = Number(productItem?.salePriceCents ?? 0) * quantity;
    return { productId: productItem?.id ?? sku, quantity, totalCents };
  });
  return {
    completedAt,
    items,
    orderId: randomUUID(),
    paymentMethod,
    totalCents: items.reduce((sum, item) => sum + item.totalCents, 0)
  };
}

function inDateRange(value: string, start?: string | null, end?: string | null): boolean {
  const date = value.slice(0, 10);
  return (!start || date >= start) && (!end || date <= end);
}

function dashboard(state: DemoState, start?: string | null, end?: string | null) {
  const filteredSales = state.sales.filter((sale) => inDateRange(sale.completedAt, start, end));
  const revenueCents = filteredSales.reduce((sum, sale) => sum + sale.totalCents, 0);
  const cogsCents = Math.floor(revenueCents * 0.45);
  const top = new Map<string, { name: string; quantity: number; revenueCents: number }>();
  for (const sale of filteredSales) {
    for (const item of sale.items) {
      const productItem = state.products.find((productEntry) => productEntry.id === item.productId);
      const name = productItem?.name ?? "Produto";
      const current = top.get(name) ?? { name, quantity: 0, revenueCents: 0 };
      current.quantity += item.quantity;
      current.revenueCents += item.totalCents;
      top.set(name, current);
    }
  }

  return {
    averageTicketCents: cents(filteredSales.length > 0 ? Math.floor(revenueCents / filteredSales.length) : 0),
    cogsCents: cents(cogsCents),
    grossProfitCents: cents(revenueCents - cogsCents),
    lowStockCount: state.products.filter((item) => item.stockStatus !== "normal").length,
    recentSales: filteredSales.slice().reverse().map((sale) => ({
      completedAt: sale.completedAt,
      orderId: sale.orderId,
      paymentMethod: sale.paymentMethod,
      totalCents: cents(sale.totalCents)
    })),
    revenueCents: cents(revenueCents),
    salesCount: filteredSales.length,
    series: [
      { cogsCents: "1040000", date: isoDate(6), grossProfitCents: "530000", revenueCents: "1570000" },
      { cogsCents: "960000", date: isoDate(5), grossProfitCents: "530000", revenueCents: "1490000" },
      { cogsCents: "900000", date: isoDate(4), grossProfitCents: "510000", revenueCents: "1410000" },
      { cogsCents: "1010000", date: isoDate(3), grossProfitCents: "470000", revenueCents: "1480000" },
      { cogsCents: "1100000", date: isoDate(2), grossProfitCents: "500000", revenueCents: "1600000" },
      { cogsCents: "1320000", date: isoDate(1), grossProfitCents: "725000", revenueCents: "2045000" },
      { cogsCents: cents(cogsCents), date: isoDate(), grossProfitCents: cents(revenueCents - cogsCents), revenueCents: cents(revenueCents) }
    ].filter((point) => inDateRange(point.date, start, end)),
    topProducts: Array.from(top.values()).map((item) => ({
      name: item.name,
      quantity: cents(item.quantity),
      revenueCents: cents(item.revenueCents)
    }))
  };
}

function json(data: unknown, status = 200): NextResponse {
  return NextResponse.json(data, { status });
}

function productWithStatus(productItem: Product): Product {
  const stock = Number(productItem.stockOnHand);
  const minStock = Number(productItem.minStock);
  return {
    ...productItem,
    stockStatus: stock <= 0 ? "zero" : stock <= minStock ? "low" : "normal"
  };
}

async function body(request: NextRequest): Promise<Record<string, unknown>> {
  return await request.json().catch(() => ({})) as Record<string, unknown>;
}

export async function GET(request: NextRequest, context: RouteContext): Promise<NextResponse> {
  const path = await routePath(context);
  const state = getState();
  const route = path.join("/");

  if (route === "items" || route === "products/catalog") return json(state.products.map(productWithStatus));
  if (route === "auth/me") return json({ email: "demo@adegaos.local", name: "Usuario demo", role: "manager" });
  if (route === "financial/dashboard") return json(dashboard(state, request.nextUrl.searchParams.get("start"), request.nextUrl.searchParams.get("end")));
  if (route === "audit/events") return json(state.audit.slice().reverse());
  if (route === "finance/payables") return json(state.payables);
  if (route === "finance/receivables") return json(state.receivables);
  if (route === "finance/cash-flow") return json({ inflowCents: "1847500", netCents: "124850", openPayablesCents: "0", openReceivablesCents: "0", outflowCents: "1722650" });
  if (route === "finance/dre") return json({ cogsCents: "845630", expensesCents: "320000", grossProfitCents: "1021890", netProfitCents: "701890", revenueCents: "1867520" });
  if (route === "inventory/movements") return json(state.products.slice(0, 12).map((item) => ({ createdAt: new Date().toISOString(), id: `mov-${item.id}`, productName: item.name, quantity: item.stockOnHand, reason: "Carga demo", type: "INITIAL_BALANCE", unitCostCents: item.costPriceCents })));
  if (route === "suppliers") return json(state.suppliers);
  if (route === "purchases") return json(state.purchases);
  if (route === "reports/exports") return json(state.reports);

  return json({ title: "Not found" }, 404);
}

export async function POST(request: NextRequest, context: RouteContext): Promise<NextResponse> {
  const path = await routePath(context);
  const state = getState();
  const route = path.join("/");
  const input = await body(request);

  if (route === "auth/login") {
    const email = String(input.email ?? "").trim();
    const password = String(input.password ?? "");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || password.length < 4) {
      return json({ detail: "Informe e-mail valido e senha com pelo menos 4 caracteres.", title: "Login invalido" }, 400);
    }

    return json({
      accessToken: `demo-${randomUUID()}`,
      expiresIn: 3600,
      principal: {
        email,
        id: randomUUID(),
        name: email.split("@")[0] ?? "Usuario",
        permissions: ["orders:create", "orders:finalize"],
        role: String(input.role ?? "manager")
      },
      refreshToken: `refresh-${randomUUID()}`
    });
  }

  if (route === "sales/finalize") {
    const lines = Array.isArray(input.items) ? input.items as { itemId?: string; quantity?: number }[] : [];
    const saleItems = lines.map((line) => {
      const productItem = state.products.find((item) => item.id === line.itemId);
      const quantity = Number(line.quantity ?? 0);
      if (productItem) {
        productItem.stockOnHand = cents(Math.max(0, Number(productItem.stockOnHand) - quantity));
      }
      return {
        productId: productItem?.id ?? String(line.itemId),
        quantity,
        totalCents: Number(productItem?.salePriceCents ?? 0) * quantity
      };
    });
    const totalCents = saleItems.reduce((sum, item) => sum + item.totalCents, 0);
    const sale: Sale = { completedAt: new Date().toISOString(), items: saleItems, orderId: randomUUID(), paymentMethod: "pix", totalCents };
    state.sales.push(sale);
    state.audit.push({ action: "sale.finalized", createdAt: sale.completedAt, id: randomUUID() });
    return json({ grossProfitCents: cents(Math.floor(totalCents * 0.55)), orderId: sale.orderId, paymentMethod: sale.paymentMethod, totalCents: cents(totalCents) });
  }

  if (route === "items") {
    const created = product(
      String(input.sku ?? `SKU-${Date.now()}`),
      String(input.name ?? "Produto demo"),
      String(input.category ?? "Outros"),
      String(input.unit ?? "un"),
      Number(input.salePriceCents ?? 0),
      0
    );
    state.products.unshift(created);
    return json(created);
  }

  if (route === "inventory/movements") {
    const id = String(input.itemId ?? "");
    const productItem = state.products.find((item) => item.id === id);
    if (productItem) {
      productItem.stockOnHand = cents(Number(productItem.stockOnHand) + Number(input.quantity ?? 0));
    }
    return json({ id: randomUUID(), ok: true });
  }

  if (route === "finance/payables" || route === "suppliers" || route === "purchases" || route === "reports/exports") {
    const entry = { ...input, createdAt: new Date().toISOString(), id: randomUUID(), status: route === "reports/exports" ? "ready" : "open" };
    if (route === "finance/payables") state.payables.push(entry);
    if (route === "suppliers") state.suppliers.push(entry);
    if (route === "purchases") state.purchases.push(entry);
    if (route === "reports/exports") state.reports.push(entry);
    return json(entry);
  }

  if (route.endsWith("/pay") || route.endsWith("/settle") || route === "finance/reconciliation") return json({ ok: true });

  if (path[0] === "products" && path[2] === "archive") {
    const productItem = state.products.find((item) => item.id === path[1]);
    if (productItem) productItem.active = false;
    return json(productItem ?? { ok: true });
  }

  if (path[0] === "products" && path[2] === "availability") {
    const productItem = state.products.find((item) => item.id === path[1]);
    if (productItem) productItem.active = Boolean(input.active);
    return json(productItem ?? { ok: true });
  }

  if (path[0] === "purchases" && path[2] === "receive") return json({ ok: true });

  return json({ ok: true });
}

export async function PATCH(request: NextRequest, context: RouteContext): Promise<NextResponse> {
  const path = await routePath(context);
  const state = getState();
  const input = await body(request);

  if (path[0] === "products" && path[1]) {
    const index = state.products.findIndex((item) => item.id === path[1]);
    if (index >= 0) {
      const current = state.products[index];
      if (!current) return json({ title: "Not found" }, 404);
      state.products[index] = {
        ...current,
        active: input.active === undefined ? current.active : Boolean(input.active),
        barcode: typeof input.barcode === "string" ? input.barcode : current.barcode,
        category: typeof input.category === "string" ? input.category : current.category,
        costPriceCents: input.costPriceCents === undefined ? current.costPriceCents : cents(Number(input.costPriceCents)),
        minStock: input.minStock === undefined ? current.minStock : cents(Number(input.minStock)),
        name: typeof input.name === "string" ? input.name : current.name,
        salePriceCents: input.salePriceCents === undefined ? current.salePriceCents : cents(Number(input.salePriceCents)),
        sku: typeof input.sku === "string" ? input.sku : current.sku,
        unit: typeof input.unit === "string" ? input.unit : current.unit
      };
      return json(productWithStatus(state.products[index] ?? current));
    }
  }

  return json({ ok: true });
}
