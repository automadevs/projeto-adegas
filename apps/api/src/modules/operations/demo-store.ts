import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException
} from "@nestjs/common";
import { randomUUID } from "node:crypto";

import { productImageKeysBySku } from "@adegaos/assets";

import { menuDemoProductSeeds } from "./demo-product-seeds";
import type {
  CreateItemInput,
  FinalizeSaleInput,
  StockMovementInput
} from "./schemas";
import {
  productImageForKey,
  ProductImageView
} from "./product-images";

export interface DemoProductView {
  readonly id: string;
  readonly name: string;
  readonly sku: string;
  readonly barcode: string | null;
  readonly category: string;
  readonly unit: string;
  readonly salePriceCents: string;
  readonly costPriceCents: string;
  readonly minStock: string;
  readonly preparationStationId: string | null;
  readonly active: boolean;
  readonly ageRestricted: boolean;
  readonly stockOnHand: string;
  readonly stockStatus: "normal" | "low" | "zero";
  readonly primaryImage: ProductImageView | null;
}

interface DemoProduct {
  id: string;
  name: string;
  sku: string;
  barcode: string | null;
  category: string;
  unit: string;
  salePriceCents: bigint;
  costPriceCents: bigint;
  minStock: number;
  active: boolean;
  ageRestricted: boolean;
  imageKey: string | null;
}

interface DemoMovement {
  readonly id: string;
  readonly productId: string;
  readonly quantity: number;
  readonly reason: string;
  readonly createdAt: Date;
}

interface DemoSale {
  readonly id: string;
  readonly totalCents: bigint;
  readonly cogsCents: bigint;
  readonly paymentMethod: string;
  readonly completedAt: Date;
  readonly items: readonly { readonly productId: string; readonly quantity: number; readonly totalCents: bigint }[];
}

interface DemoAuditEvent {
  readonly id: string;
  readonly action: string;
  readonly payload: unknown;
  readonly createdAt: Date;
}

@Injectable()
export class DemoStore {
  private readonly products = new Map<string, DemoProduct>();
  private readonly movements: DemoMovement[] = [];
  private readonly sales: DemoSale[] = [];
  private readonly audit: DemoAuditEvent[] = [];
  private readonly idempotency = new Map<string, unknown>();

  constructor() {
    this.seed();
  }

  capabilities() {
    return {
      roles: ["owner", "manager", "attendant"],
      actions: [
        "create_item",
        "adjust_stock",
        "finalize_sale",
        "view_financial_dashboard",
        "view_audit"
      ]
    };
  }

  listItems(search?: string): DemoProductView[] {
    const query = search?.toLowerCase().trim();
    return Array.from(this.products.values())
      .filter((product) => {
        if (!query) {
          return true;
        }

        return (
          product.name.toLowerCase().includes(query) ||
          product.sku.toLowerCase().includes(query) ||
          product.barcode?.toLowerCase().includes(query)
        );
      })
      .sort((left, right) => left.name.localeCompare(right.name))
      .map((product) => this.toProductView(product));
  }

  createItem(input: CreateItemInput): DemoProductView {
    const product: DemoProduct = {
      id: randomUUID(),
      name: input.name,
      sku: input.sku,
      barcode: input.barcode ?? null,
      category: input.category,
      unit: input.unit,
      salePriceCents: BigInt(input.salePriceCents),
      costPriceCents: BigInt(input.costPriceCents),
      minStock: input.minStock,
      active: input.active,
      ageRestricted: input.ageRestricted,
      imageKey: null
    };
    this.products.set(product.id, product);
    this.addAudit("product.created", { productId: product.id, sku: product.sku });
    return this.toProductView(product);
  }

  createInventoryMovement(
    input: StockMovementInput,
    idempotencyKey?: string
  ): { readonly movementId: string; readonly balance: string } {
    const key = idempotencyKey ? `inventory:${idempotencyKey}` : undefined;
    const existing = key ? this.idempotency.get(key) : undefined;
    if (existing) {
      return existing as { readonly movementId: string; readonly balance: string };
    }

    const product = this.mustProduct(input.itemId);
    const quantity = input.type === "LOSS" ? -Math.abs(input.quantity) : input.quantity;
    const movement: DemoMovement = {
      id: randomUUID(),
      productId: product.id,
      quantity,
      reason: input.reason,
      createdAt: new Date()
    };
    this.movements.push(movement);
    this.addAudit("inventory.movement.created", {
      movementId: movement.id,
      productId: product.id,
      quantity,
      reason: input.reason
    });
    const response = {
      movementId: movement.id,
      balance: this.balance(product.id).toString()
    };

    if (key) {
      this.idempotency.set(key, response);
    }

    return response;
  }

  inventoryBalances() {
    return this.listItems().map((product) => ({
      itemId: product.id,
      name: product.name,
      sku: product.sku,
      quantityOnHand: product.stockOnHand,
      minStock: product.minStock,
      status: product.stockStatus,
      lastMovementAt:
        this.movements
          .filter((movement) => movement.productId === product.id)
          .at(-1)
          ?.createdAt.toISOString() ?? null
    }));
  }

  finalizeSale(input: FinalizeSaleInput, idempotencyKey?: string) {
    if (!idempotencyKey) {
      throw new BadRequestException("Idempotency-Key header is required.");
    }

    const key = `sale:${idempotencyKey}`;
    const existing = this.idempotency.get(key);
    if (existing) {
      return existing;
    }

    let totalCents = 0n;
    let cogsCents = 0n;
    const saleItems: DemoSale["items"] = input.items.map((item) => {
      const product = this.mustProduct(item.itemId);
      const balance = this.balance(product.id);
      if (balance < item.quantity) {
        throw new ConflictException(`Insufficient stock for ${product.name}.`);
      }

      const total = product.salePriceCents * BigInt(item.quantity);
      const cogs = product.costPriceCents * BigInt(item.quantity);
      totalCents += total;
      cogsCents += cogs;
      return { productId: product.id, quantity: item.quantity, totalCents: total };
    });

    if (BigInt(input.payment.amountCents) < totalCents) {
      throw new BadRequestException("Payment amount is lower than sale total.");
    }

    const sale: DemoSale = {
      id: randomUUID(),
      totalCents,
      cogsCents,
      paymentMethod: input.payment.method,
      completedAt: new Date(),
      items: saleItems
    };
    this.sales.push(sale);

    for (const item of input.items) {
      const product = this.mustProduct(item.itemId);
      this.movements.push({
        id: randomUUID(),
        productId: product.id,
        quantity: -item.quantity,
        reason: "Venda finalizada",
        createdAt: new Date()
      });
    }

    this.addAudit("sale.finalized", {
      orderId: sale.id,
      totalCents: totalCents.toString(),
      paymentMethod: sale.paymentMethod
    });

    const response = {
      orderId: sale.id,
      totalCents: totalCents.toString(),
      costOfGoodsCents: cogsCents.toString(),
      grossProfitCents: (totalCents - cogsCents).toString(),
      paymentMethod: sale.paymentMethod,
      items: input.items.map((item) => ({
        name: this.mustProduct(item.itemId).name,
        quantity: item.quantity.toString()
      }))
    };
    this.idempotency.set(key, response);
    return response;
  }

  dashboard(filters: { readonly end?: string; readonly start?: string } = {}) {
    const sales = this.sales.filter((sale) => {
      const date = sale.completedAt.toISOString().slice(0, 10);
      return (!filters.start || date >= filters.start) && (!filters.end || date <= filters.end);
    });
    const revenue = sales.reduce((sum, sale) => sum + sale.totalCents, 0n);
    const cogs = sales.reduce((sum, sale) => sum + sale.cogsCents, 0n);
    const byDay = new Map<string, { revenue: bigint; cogs: bigint }>();
    const top = new Map<string, { name: string; quantity: number; revenue: bigint }>();

    for (const sale of sales) {
      const key = sale.completedAt.toISOString().slice(0, 10);
      const current = byDay.get(key) ?? { revenue: 0n, cogs: 0n };
      current.revenue += sale.totalCents;
      current.cogs += sale.cogsCents;
      byDay.set(key, current);

      for (const item of sale.items) {
        const product = this.mustProduct(item.productId);
        const currentTop = top.get(product.id) ?? {
          name: product.name,
          quantity: 0,
          revenue: 0n
        };
        currentTop.quantity += item.quantity;
        currentTop.revenue += item.totalCents;
        top.set(product.id, currentTop);
      }
    }

    return {
      revenueCents: revenue.toString(),
      cogsCents: cogs.toString(),
      grossProfitCents: (revenue - cogs).toString(),
      salesCount: sales.length,
      averageTicketCents:
        sales.length > 0 ? (revenue / BigInt(sales.length)).toString() : "0",
      lowStockCount: this.inventoryBalances().filter((balance) => balance.status !== "normal").length,
      series: Array.from(byDay.entries()).map(([date, value]) => ({
        date,
        revenueCents: value.revenue.toString(),
        cogsCents: value.cogs.toString(),
        grossProfitCents: (value.revenue - value.cogs).toString()
      })),
      topProducts: Array.from(top.values())
        .sort((left, right) => Number(right.revenue - left.revenue))
        .slice(0, 5)
        .map((item) => ({
          name: item.name,
          quantity: item.quantity.toString(),
          revenueCents: item.revenue.toString()
        })),
      recentSales: sales.slice(-8).reverse().map((sale) => ({
        orderId: sale.id,
        totalCents: sale.totalCents.toString(),
        paymentMethod: sale.paymentMethod,
        completedAt: sale.completedAt.toISOString()
      }))
    };
  }

  auditEvents() {
    return this.audit.slice(-25).reverse().map((event) => ({
      id: event.id,
      action: event.action,
      createdAt: event.createdAt.toISOString(),
      payload: event.payload
    }));
  }

  private seed(): void {
    const samples: readonly Omit<DemoProduct, "id" | "imageKey">[] = [
      {
        name: "Cerveja Skol Lata 350ml",
        sku: "SKOL350",
        barcode: null,
        category: "Cervejas",
        unit: "un",
        salePriceCents: 329n,
        costPriceCents: 184n,
        minStock: 30,
        active: true,
        ageRestricted: true
      },
      {
        name: "Cerveja Brahma Lata 350ml",
        sku: "BRA350",
        barcode: null,
        category: "Cervejas",
        unit: "un",
        salePriceCents: 329n,
        costPriceCents: 190n,
        minStock: 25,
        active: true,
        ageRestricted: true
      },
      {
        name: "Whisky Johnnie Walker Red 1L",
        sku: "JWRED1L",
        barcode: null,
        category: "Destilados",
        unit: "garrafa",
        salePriceCents: 8990n,
        costPriceCents: 6100n,
        minStock: 6,
        active: true,
        ageRestricted: true
      },
      {
        name: "Energético Red Bull 250ml",
        sku: "REDBULL250",
        barcode: null,
        category: "Energéticos",
        unit: "un",
        salePriceCents: 890n,
        costPriceCents: 540n,
        minStock: 40,
        active: true,
        ageRestricted: false
      },
      {
        name: "Água Mineral Crystal 500ml",
        sku: "CRYSTAL500",
        barcode: null,
        category: "Conveniência",
        unit: "un",
        salePriceCents: 250n,
        costPriceCents: 95n,
        minStock: 50,
        active: true,
        ageRestricted: false
      },
      {
        name: "Cerveja Heineken Long Neck 330ml",
        sku: "HEINEKEN330",
        barcode: null,
        category: "Cervejas",
        unit: "un",
        salePriceCents: 649n,
        costPriceCents: 395n,
        minStock: 18,
        active: true,
        ageRestricted: true
      },
      {
        name: "Antarctica Subzero 350ml",
        sku: "ANT350",
        barcode: null,
        category: "Cervejas",
        unit: "un",
        salePriceCents: 319n,
        costPriceCents: 175n,
        minStock: 20,
        active: true,
        ageRestricted: true
      },
      {
        name: "Coca-Cola 2L",
        sku: "COCA2L",
        barcode: null,
        category: "Refrigerantes",
        unit: "un",
        salePriceCents: 949n,
        costPriceCents: 520n,
        minStock: 14,
        active: true,
        ageRestricted: false
      },
      {
        name: "Smirnoff 998ml",
        sku: "SMIRNOFF998",
        barcode: null,
        category: "Destilados",
        unit: "garrafa",
        salePriceCents: 6490n,
        costPriceCents: 4300n,
        minStock: 8,
        active: true,
        ageRestricted: true
      },
      {
        name: "Energético TNT 269ml",
        sku: "TNT269",
        barcode: null,
        category: "Energéticos",
        unit: "un",
        salePriceCents: 790n,
        costPriceCents: 420n,
        minStock: 40,
        active: true,
        ageRestricted: false
      }
    ];

    const openingStockBySku = new Map<string, number>([
      ["SKOL350", 12],
      ["BRA350", 8],
      ["JWRED1L", 3],
      ["REDBULL250", 15],
      ["CRYSTAL500", 18],
      ["HEINEKEN330", 36],
      ["ANT350", 44],
      ["COCA2L", 24],
      ["SMIRNOFF998", 10],
      ["TNT269", 15]
    ]);
    const productBySku = new Map<string, DemoProduct>();

    for (const sample of samples) {
      const product: DemoProduct = {
        ...sample,
        id: randomUUID(),
        imageKey: imageKeyForSku(sample.sku)
      };
      this.products.set(product.id, product);
      productBySku.set(product.sku, product);
      this.movements.push({
        id: randomUUID(),
        productId: product.id,
        quantity: openingStockBySku.get(product.sku) ?? 20,
        reason: "Carga demo",
        createdAt: new Date()
      });
    }

    for (const sample of menuDemoProductSeeds) {
      const { openingStock, ...productInput } = sample;
      const product: DemoProduct = {
        ...productInput,
        id: randomUUID(),
        imageKey: imageKeyForSku(sample.sku)
      };
      this.products.set(product.id, product);
      productBySku.set(product.sku, product);
      this.movements.push({
        id: randomUUID(),
        productId: product.id,
        quantity: openingStock,
        reason: "Carga demo",
        createdAt: new Date()
      });
    }

    const addSale = (
      completedAt: string,
      paymentMethod: string,
      lines: readonly { readonly sku: string; readonly quantity: number }[]
    ) => {
      let totalCents = 0n;
      let cogsCents = 0n;
      const items = lines.map((line) => {
        const product = productBySku.get(line.sku);
        if (!product) {
          throw new Error(`Missing demo product ${line.sku}`);
        }

        const total = product.salePriceCents * BigInt(line.quantity);
        totalCents += total;
        cogsCents += product.costPriceCents * BigInt(line.quantity);
        return {
          productId: product.id,
          quantity: line.quantity,
          totalCents: total
        };
      });

      this.sales.push({
        id: randomUUID(),
        totalCents,
        cogsCents,
        paymentMethod,
        completedAt: new Date(completedAt),
        items
      });
    };

    addSale("2025-05-17T10:42:00-03:00", "pix", [
      { sku: "SKOL350", quantity: 18 },
      { sku: "BRA350", quantity: 14 },
      { sku: "REDBULL250", quantity: 5 }
    ]);
    addSale("2025-05-18T11:40:00-03:00", "card", [
      { sku: "HEINEKEN330", quantity: 12 },
      { sku: "ANT350", quantity: 10 },
      { sku: "COCA2L", quantity: 4 }
    ]);
    addSale("2025-05-19T13:47:00-03:00", "cash", [
      { sku: "JWRED1L", quantity: 1 },
      { sku: "SMIRNOFF998", quantity: 1 },
      { sku: "TNT269", quantity: 6 }
    ]);
    addSale("2025-05-20T13:12:00-03:00", "pix", [
      { sku: "SKOL350", quantity: 24 },
      { sku: "HEINEKEN330", quantity: 8 },
      { sku: "CRYSTAL500", quantity: 16 }
    ]);
    addSale("2025-05-21T12:58:00-03:00", "cash", [
      { sku: "BRA350", quantity: 20 },
      { sku: "COCA2L", quantity: 6 },
      { sku: "REDBULL250", quantity: 4 }
    ]);
    addSale("2025-05-22T12:36:00-03:00", "card", [
      { sku: "JWRED1L", quantity: 2 },
      { sku: "HEINEKEN330", quantity: 10 },
      { sku: "TNT269", quantity: 4 }
    ]);
    addSale("2025-05-23T14:01:00-03:00", "card", [
      { sku: "SMIRNOFF998", quantity: 2 },
      { sku: "SKOL350", quantity: 12 },
      { sku: "ANT350", quantity: 8 }
    ]);
    addSale("2025-05-23T14:32:00-03:00", "pix", [
      { sku: "JWRED1L", quantity: 1 },
      { sku: "REDBULL250", quantity: 4 },
      { sku: "HEINEKEN330", quantity: 5 }
    ]);
  }

  private seedLegacy(): void {
    const samples: readonly Omit<DemoProduct, "id" | "imageKey">[] = [
      {
        name: "Cerveja lata",
        sku: "CERV-LATA",
        barcode: null,
        category: "Bebidas",
        unit: "un",
        salePriceCents: 750n,
        costPriceCents: 420n,
        minStock: 10,
        active: true,
        ageRestricted: true
      },
      {
        name: "Agua mineral",
        sku: "AGUA-500",
        barcode: null,
        category: "Bebidas",
        unit: "un",
        salePriceCents: 400n,
        costPriceCents: 180n,
        minStock: 12,
        active: true,
        ageRestricted: false
      },
      {
        name: "Gelo 5kg",
        sku: "GELO-5KG",
        barcode: null,
        category: "Conveniência",
        unit: "pct",
        salePriceCents: 1490n,
        costPriceCents: 900n,
        minStock: 4,
        active: true,
        ageRestricted: false
      }
    ];

    for (const sample of samples) {
      const product: DemoProduct = { ...sample, id: randomUUID(), imageKey: null };
      this.products.set(product.id, product);
      this.movements.push({
        id: randomUUID(),
        productId: product.id,
        quantity: 20,
        reason: "Carga demo",
        createdAt: new Date()
      });
    }
  }

  private mustProduct(id: string): DemoProduct {
    const product = this.products.get(id);
    if (!product) {
      throw new NotFoundException("Product not found.");
    }

    return product;
  }

  private balance(productId: string): number {
    return this.movements
      .filter((movement) => movement.productId === productId)
      .reduce((sum, movement) => sum + movement.quantity, 0);
  }

  private toProductView(product: DemoProduct): DemoProductView {
    const stockOnHand = this.balance(product.id);
    return {
      id: product.id,
      name: product.name,
      sku: product.sku,
      barcode: product.barcode,
      category: product.category,
      unit: product.unit,
      salePriceCents: product.salePriceCents.toString(),
      costPriceCents: product.costPriceCents.toString(),
      minStock: product.minStock.toString(),
      preparationStationId: null,
      active: product.active,
      ageRestricted: product.ageRestricted,
      stockOnHand: stockOnHand.toString(),
      stockStatus:
        stockOnHand <= 0 ? "zero" : stockOnHand <= product.minStock ? "low" : "normal",
      primaryImage: product.imageKey ? productImageForKey(product.imageKey) : null
    };
  }

  private addAudit(action: string, payload: unknown): void {
    this.audit.push({
      id: randomUUID(),
      action,
      payload,
      createdAt: new Date()
    });
  }
}

function imageKeyForSku(sku: string): string | null {
  if (Object.prototype.hasOwnProperty.call(productImageKeysBySku, sku)) {
    return productImageKeysBySku[sku as keyof typeof productImageKeysBySku];
  }

  return null;
}
