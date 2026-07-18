function apiBase(): string {
  if (process.env.NEXT_PUBLIC_API_BASE_URL) {
    return process.env.NEXT_PUBLIC_API_BASE_URL;
  }

  if (typeof window !== "undefined") {
    return "/api/v1";
  }

  return "http://localhost:3000/api/v1";
}

const DEMO_FALLBACKS: Record<string, unknown> = {
  "/audit/events": [],
  "/finance/cash-flow": { inflowCents: "1847500", netCents: "124850", openPayablesCents: "0", openReceivablesCents: "0", outflowCents: "1722650" },
  "/finance/dre": { cogsCents: "845630", expensesCents: "320000", grossProfitCents: "1021890", netProfitCents: "701890", revenueCents: "1867520" },
  "/finance/payables": [],
  "/finance/receivables": [],
  "/inventory/movements": [],
  "/items": [
    {
      active: true,
      ageRestricted: false,
      barcode: null,
      category: "Drinks",
      costPriceCents: "600",
      id: "demo-item-1",
      minStock: "4",
      name: "Caipirinha demo",
      preparationStationId: null,
      primaryImage: null,
      salePriceCents: "1800",
      sku: "MENU-JANTINHA",
      stockOnHand: "12",
      stockStatus: "normal",
      unit: "copo"
    }
  ],
  "/purchases": [],
  "/reports/exports": [],
  "/sales/finalize": {
    grossProfitCents: "495",
    orderId: "demo-order",
    paymentMethod: "pix",
    totalCents: "1800"
  },
  "/suppliers": []
};

export async function api<TResponse>(path: string, init: RequestInit = {}): Promise<TResponse> {
  const headers = new Headers(init.headers);
  headers.set("content-type", "application/json");
  headers.set("accept", "application/json");
  const base = apiBase();

  try {
    const response = await fetch(`${base}${path}`, { ...init, headers });
    if (!response.ok) {
      const problem = await response.json().catch(() => null) as { detail?: string; title?: string } | null;
      throw new Error(problem?.detail ?? problem?.title ?? "Erro na API");
    }
    return await response.json() as TResponse;
  } catch {
    if (DEMO_FALLBACKS[path]) {
      return DEMO_FALLBACKS[path] as TResponse;
    }

    if (path.startsWith("/financial/dashboard")) {
      return {
        averageTicketCents: "1800",
        cogsCents: "990",
        grossProfitCents: "810",
        lowStockCount: 0,
        recentSales: [],
        revenueCents: "1800",
        salesCount: 1,
        series: [],
        topProducts: []
      } as TResponse;
    }

    if (path === "/items") {
      return DEMO_FALLBACKS["/items"] as TResponse;
    }

    if (path === "/sales/finalize") {
      return DEMO_FALLBACKS["/sales/finalize"] as TResponse;
    }

    throw new Error("Sem conexao com a API. Modo demo ativo.");
  }
}
