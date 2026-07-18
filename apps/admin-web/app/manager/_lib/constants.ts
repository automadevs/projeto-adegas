import type { IconName } from "../_components/icons";
import type { Dashboard, ManagerData, NavId } from "./types";

export const navItems: readonly { id: NavId; label: string; icon: IconName }[] = [
  { id: "dashboard", label: "Dashboard", icon: "dashboard" },
  { id: "financeiro", label: "Financeiro", icon: "dollar" },
  { id: "produtos", label: "Produtos", icon: "box" },
  { id: "estoque", label: "Estoque", icon: "cube" },
  { id: "vendas", label: "Vendas", icon: "cart" },
  { id: "fornecedores", label: "Fornecedores", icon: "truck" },
  { id: "compras", label: "Compras", icon: "receipt" },
  { id: "relatorios", label: "Relatorios", icon: "chart" },
  { id: "funcionarios", label: "Funcionarios", icon: "users" },
  { id: "administracao", label: "Configuracoes", icon: "settings" }
];

export const managerRoutes: Record<NavId, string> = {
  administracao: "/manager/admin",
  compras: "/manager/purchases",
  dashboard: "/manager/dashboard",
  estoque: "/manager/inventory",
  financeiro: "/manager/finance",
  fornecedores: "/manager/suppliers",
  funcionarios: "/manager/employees",
  produtos: "/manager/products",
  relatorios: "/manager/reports",
  vendas: "/manager/sales"
};

export const dateRangeOptions = [
  { label: "Hoje", value: "today" },
  { label: "7 dias", value: "7d" },
  { label: "30 dias", value: "30d" }
] as const;

export type DateRangeValue = (typeof dateRangeOptions)[number]["value"];

export const branchOptions = [
  { label: "Loja matriz", value: "matriz" },
  { label: "Filial centro", value: "filial-centro" },
  { label: "Filial delivery", value: "filial-delivery" }
] as const;

export const categories = ["Todas", "Cerveja", "Whisky", "Vodka", "Energetico", "Refrigerante", "Agua", "Vinho", "Destilado", "Outros"] as const;
export const productSkeletonSlots = [0, 1, 2, 3, 4, 5, 6, 7, 8] as const;

export const emptyDashboard: Dashboard = {
  averageTicketCents: "0",
  cogsCents: "0",
  grossProfitCents: "0",
  lowStockCount: 0,
  recentSales: [],
  revenueCents: "0",
  salesCount: 0,
  series: [],
  topProducts: []
};

export const emptyManagerData: ManagerData = {
  cashFlow: {
    inflowCents: "0",
    netCents: "0",
    openPayablesCents: "0",
    openReceivablesCents: "0",
    outflowCents: "0"
  },
  dre: {
    cogsCents: "0",
    expensesCents: "0",
    grossProfitCents: "0",
    netProfitCents: "0",
    revenueCents: "0"
  },
  inventoryMovements: [],
  payables: [],
  purchases: [],
  receivables: [],
  reportExports: [],
  suppliers: []
};

export const fallbackSeries = [
  { cogs: 10400, label: "17/05", margin: 65, revenue: 15700 },
  { cogs: 9600, label: "18/05", margin: 59, revenue: 14900 },
  { cogs: 9000, label: "19/05", margin: 56, revenue: 14100 },
  { cogs: 10100, label: "20/05", margin: 56, revenue: 14800 },
  { cogs: 11000, label: "21/05", margin: 58, revenue: 16000 },
  { cogs: 13200, label: "22/05", margin: 63, revenue: 20400 },
  { cogs: 12400, label: "23/05", margin: 61, revenue: 18745 }
] as const;
