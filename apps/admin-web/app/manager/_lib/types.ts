export interface ProductImage {
  readonly altText: string;
  readonly height: number;
  readonly status: string;
  readonly url: string;
  readonly width: number;
}

export interface Product {
  readonly active: boolean;
  readonly barcode: string | null;
  readonly category: string;
  readonly costPriceCents: string;
  readonly id: string;
  readonly minStock: string;
  readonly name: string;
  readonly primaryImage?: ProductImage | null;
  readonly salePriceCents: string;
  readonly sku: string;
  readonly stockOnHand: string;
  readonly stockStatus: "normal" | "low" | "zero";
  readonly unit: string;
}

export interface Dashboard {
  readonly averageTicketCents: string;
  readonly cogsCents: string;
  readonly grossProfitCents: string;
  readonly lowStockCount: number;
  readonly recentSales: readonly {
    readonly completedAt: string;
    readonly orderId: string;
    readonly paymentMethod: string;
    readonly totalCents: string;
  }[];
  readonly revenueCents: string;
  readonly salesCount: number;
  readonly series: readonly {
    readonly cogsCents: string;
    readonly date: string;
    readonly grossProfitCents: string;
    readonly revenueCents: string;
  }[];
  readonly topProducts: readonly {
    readonly name: string;
    readonly quantity: string;
    readonly revenueCents: string;
  }[];
}

export interface AuditEvent {
  readonly action: string;
  readonly createdAt: string;
  readonly id: string;
}

export interface AccountPayable {
  readonly amountCents: string;
  readonly description: string;
  readonly dueDate: string;
  readonly id: string;
  readonly openCents: string;
  readonly status: string;
}

export interface AccountReceivable {
  readonly description: string;
  readonly dueDate: string;
  readonly grossCents: string;
  readonly id: string;
  readonly netExpectedCents: string;
  readonly openCents: string;
  readonly status: string;
}

export interface CashFlow {
  readonly inflowCents: string;
  readonly netCents: string;
  readonly openPayablesCents: string;
  readonly openReceivablesCents: string;
  readonly outflowCents: string;
}

export interface Dre {
  readonly cogsCents: string;
  readonly expensesCents: string;
  readonly grossProfitCents: string;
  readonly netProfitCents: string;
  readonly revenueCents: string;
}

export interface InventoryMovement {
  readonly createdAt: string;
  readonly id: string;
  readonly productName: string;
  readonly quantity: string;
  readonly reason: string | null;
  readonly type: string;
  readonly unitCostCents: string;
}

export interface Supplier {
  readonly active?: boolean;
  readonly contactName?: string | null;
  readonly email?: string | null;
  readonly id: string;
  readonly leadTimeDays?: number;
  readonly name: string;
  readonly phone?: string | null;
  readonly whatsapp?: string | null;
}

export interface PurchaseOrder {
  readonly expectedAt?: string | null;
  readonly id: string;
  readonly orderedAt: string;
  readonly status: string;
  readonly totalCents: string;
}

export interface ReportExport {
  readonly createdAt: string;
  readonly expiresAt: string | null;
  readonly format: string;
  readonly id: string;
  readonly status: string;
  readonly storageKey: string | null;
  readonly type: string;
}

export interface ManagerData {
  readonly cashFlow: CashFlow;
  readonly dre: Dre;
  readonly inventoryMovements: readonly InventoryMovement[];
  readonly payables: readonly AccountPayable[];
  readonly purchases: readonly PurchaseOrder[];
  readonly receivables: readonly AccountReceivable[];
  readonly reportExports: readonly ReportExport[];
  readonly suppliers: readonly Supplier[];
}

export interface CartLine {
  readonly product: Product;
  readonly quantity: number;
}

export interface SaleResult {
  readonly grossProfitCents: string;
  readonly orderId: string;
  readonly paymentMethod: string;
  readonly totalCents: string;
}

export type NavId =
  | "dashboard"
  | "financeiro"
  | "produtos"
  | "estoque"
  | "vendas"
  | "fornecedores"
  | "compras"
  | "relatorios"
  | "funcionarios"
  | "administracao";

export interface ProductFormInput {
  readonly active: boolean;
  readonly barcode: string;
  readonly category: string;
  readonly costPrice: string;
  readonly currentStock: string;
  readonly minStock: string;
  readonly name: string;
  readonly salePrice: string;
  readonly sku: string;
  readonly unit: string;
}

export interface PayableInput {
  readonly amount: string;
  readonly description: string;
  readonly dueDate: string;
}

export interface SupplierInput {
  readonly contactName: string;
  readonly email: string;
  readonly leadTimeDays: string;
  readonly name: string;
  readonly phone: string;
  readonly whatsapp: string;
}

export interface PurchaseInput {
  readonly items: readonly {
    readonly productId: string;
    readonly quantity: number;
    readonly unitCost: string;
  }[];
  readonly supplierId: string;
}
