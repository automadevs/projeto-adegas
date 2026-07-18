import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException
} from "@nestjs/common";
import { createHash, randomUUID } from "node:crypto";

import { findProductImage, productImageKeysBySku } from "@adegaos/assets";
import {
  CustomerTabStatus,
  FinancialEntryType,
  OrderItemStatus,
  OrderStatus,
  OrderType,
  PaymentStatus,
  PreparationTicketStatus,
  Prisma,
  PrismaClient,
  ServiceTableStatus,
  StockMovementType
} from "@adegaos/database";

import { PrismaService } from "../../shared/database/prisma.service";
import { menuDemoProductSeeds } from "./demo-product-seeds";
import { DemoStore } from "./demo-store";
import {
  ProductImageView,
  storageKeyToPublicUrl
} from "./product-images";
import {
  DEMO_BRANCH_ID,
  DEMO_TENANT_ID,
  DEMO_USER_ID,
  RequestScope
} from "./scope";
import type {
  AddOrderItemInput,
  CompleteOrderInput,
  CreateCategoryInput,
  CreateItemInput,
  CreateOrderInput,
  CreatePreparationStationInput,
  CreateTabInput,
  CreateTableInput,
  FinalizeSaleInput,
  StockMovementInput,
  UpdateCategoryInput,
  UpdateOrderItemInput,
  UpdatePreparationStationInput,
  UpdateProductAvailabilityInput,
  UpdateProductInput
} from "./schemas";

type Tx = Parameters<Parameters<PrismaClient["$transaction"]>[0]>[0];

interface DemoProductSeed {
  readonly name: string;
  readonly sku: string;
  readonly barcode: string | null;
  readonly category: string;
  readonly unit: string;
  readonly salePriceCents: bigint;
  readonly costPriceCents: bigint;
  readonly minStock: number;
  readonly active: boolean;
  readonly ageRestricted: boolean;
  readonly openingStock: number;
}

const coreDemoProductSeeds: readonly DemoProductSeed[] = [
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
    ageRestricted: true,
    openingStock: 12
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
    ageRestricted: true,
    openingStock: 8
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
    ageRestricted: true,
    openingStock: 3
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
    ageRestricted: false,
    openingStock: 15
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
    ageRestricted: false,
    openingStock: 18
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
    ageRestricted: true,
    openingStock: 36
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
    ageRestricted: true,
    openingStock: 44
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
    ageRestricted: false,
    openingStock: 24
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
    ageRestricted: true,
    openingStock: 10
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
    ageRestricted: false,
    openingStock: 15
  }
];

const demoProductSeeds: readonly DemoProductSeed[] = [
  ...coreDemoProductSeeds,
  ...menuDemoProductSeeds
];

export interface ProductView {
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

export interface CategoryView {
  readonly id: string;
  readonly name: string;
  readonly displayOrder: number;
  readonly active: boolean;
}

export interface PreparationStationView {
  readonly id: string;
  readonly name: string;
  readonly active: boolean;
}

export interface ServiceTableView {
  readonly id: string;
  readonly name: string;
  readonly status: string;
  readonly active: boolean;
}

export interface CustomerTabView {
  readonly id: string;
  readonly displayNumber: number;
  readonly customerLabel: string | null;
  readonly status: string;
}

export interface OrderLineView {
  readonly id: string;
  readonly productId: string;
  readonly productName: string;
  readonly quantity: string;
  readonly unitPriceCents: string;
  readonly totalCents: string;
  readonly status: string;
  readonly stationId: string | null;
  readonly note: string | null;
}

export interface OrderView {
  readonly id: string;
  readonly type: string;
  readonly status: string;
  readonly tableId: string | null;
  readonly tabId: string | null;
  readonly subtotalCents: string;
  readonly discountCents: string;
  readonly totalCents: string;
  readonly costOfGoodsCents: string;
  readonly version: number;
  readonly openedAt: string;
  readonly closedAt: string | null;
  readonly completedAt: string | null;
  readonly items: readonly OrderLineView[];
}

export interface PreparationTicketView {
  readonly id: string;
  readonly stationId: string;
  readonly stationName: string;
  readonly orderId: string;
  readonly status: string;
  readonly receivedAt: string;
  readonly startedAt: string | null;
  readonly readyAt: string | null;
  readonly items: readonly {
    readonly id: string;
    readonly orderItemId: string;
    readonly productName: string;
    readonly quantity: string;
    readonly status: string;
    readonly note: string | null;
  }[];
}

export interface DemoBootstrapView {
  readonly mode: "database" | "memory";
  readonly catalogReady: boolean;
  readonly products: number;
  readonly categories: number;
  readonly stockMovements: number;
  readonly stockedProducts: number;
  readonly productImages: number;
  readonly tables: number;
  readonly preparationStations: number;
}

@Injectable()
export class OperationsService {
  private readonly demoStore = new DemoStore();
  private demoScopeReady: Promise<void> | null = null;

  constructor(private readonly prismaService: PrismaService) {}

  async capabilities(): Promise<{
    readonly actions: readonly string[];
    readonly roles: readonly string[];
  }> {
    if (!this.prismaService.isAvailable()) {
      return this.demoStore.capabilities();
    }

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

  async bootstrapDemoData(): Promise<DemoBootstrapView> {
    if (!this.prismaService.isAvailable()) {
      const items = this.demoStore.listItems();
      const categories = new Set(items.map((product) => product.category));
      const stockedProducts = items.filter(
        (product) => Number(product.stockOnHand) > 0
      ).length;
      const productImages = items.filter((product) => product.primaryImage).length;

      return {
        mode: "memory",
        catalogReady:
          items.length > 0 &&
          categories.size > 0 &&
          stockedProducts > 0 &&
          productImages > 0,
        products: items.length,
        categories: categories.size,
        stockMovements: stockedProducts,
        stockedProducts,
        productImages,
        tables: demoTables().length,
        preparationStations: demoStations().length
      };
    }

    await this.ensureDemoScope();

    const [
      products,
      categories,
      stockMovements,
      stockedProductGroups,
      productImages,
      tables,
      preparationStations
    ] = await Promise.all([
      this.prisma.product.count({
        where: { tenantId: DEMO_TENANT_ID, branchId: DEMO_BRANCH_ID }
      }),
      this.prisma.category.count({
        where: { tenantId: DEMO_TENANT_ID }
      }),
      this.prisma.stockMovement.count({
        where: { tenantId: DEMO_TENANT_ID, branchId: DEMO_BRANCH_ID }
      }),
      this.prisma.stockMovement.groupBy({
        by: ["productId"],
        where: { tenantId: DEMO_TENANT_ID, branchId: DEMO_BRANCH_ID }
      }),
      this.prisma.productImage.count({
        where: {
          tenantId: DEMO_TENANT_ID,
          product: { branchId: DEMO_BRANCH_ID },
          isPrimary: true,
          archivedAt: null
        }
      }),
      this.prisma.serviceTable.count({
        where: { tenantId: DEMO_TENANT_ID, branchId: DEMO_BRANCH_ID }
      }),
      this.prisma.preparationStation.count({
        where: { tenantId: DEMO_TENANT_ID, branchId: DEMO_BRANCH_ID }
      })
    ]);

    return {
      mode: "database",
      catalogReady:
        products > 0 &&
        categories > 0 &&
        stockMovements > 0 &&
        stockedProductGroups.length > 0 &&
        productImages > 0 &&
        tables > 0 &&
        preparationStations > 0,
      products,
      categories,
      stockMovements,
      stockedProducts: stockedProductGroups.length,
      productImages,
      tables,
      preparationStations
    };
  }

  async listCategories(scope: RequestScope): Promise<CategoryView[]> {
    if (!this.prismaService.isAvailable()) {
      const names = Array.from(
        new Set(this.demoStore.listItems().map((product) => product.category))
      );
      return names.map((name, index) => ({
        id: `demo-category-${index + 1}`,
        name,
        displayOrder: index,
        active: true
      }));
    }

    await this.ensureDemoScope();
    const categories = await this.prisma.category.findMany({
      where: { tenantId: scope.tenantId },
      orderBy: [{ displayOrder: "asc" }, { name: "asc" }]
    });

    return categories.map(toCategoryView);
  }

  async createCategory(
    scope: RequestScope,
    input: CreateCategoryInput
  ): Promise<CategoryView> {
    if (!this.prismaService.isAvailable()) {
      return {
        id: randomUUID(),
        name: input.name,
        displayOrder: input.displayOrder,
        active: input.active
      };
    }

    await this.ensureDemoScope();
    const category = await this.prisma.category.create({
      data: {
        tenantId: scope.tenantId,
        name: input.name,
        displayOrder: input.displayOrder,
        active: input.active
      }
    });
    await this.audit(scope, "category.created", {
      categoryId: category.id,
      name: category.name
    });

    return toCategoryView(category);
  }

  async updateCategory(
    scope: RequestScope,
    categoryId: string,
    input: UpdateCategoryInput
  ): Promise<CategoryView> {
    if (!this.prismaService.isAvailable()) {
      return {
        id: categoryId,
        name: input.name ?? "Categoria",
        displayOrder: input.displayOrder ?? 0,
        active: input.active ?? true
      };
    }

    await this.ensureDemoScope();
    await this.mustCategory(scope, categoryId);
    const category = await this.prisma.category.update({
      where: { id: categoryId },
      data: input
    });
    await this.audit(scope, "category.updated", {
      categoryId,
      changes: input
    });

    return toCategoryView(category);
  }

  async archiveCategory(scope: RequestScope, categoryId: string): Promise<CategoryView> {
    return this.updateCategory(scope, categoryId, { active: false });
  }

  async listPreparationStations(scope: RequestScope): Promise<PreparationStationView[]> {
    if (!this.prismaService.isAvailable()) {
      return demoStations();
    }

    await this.ensureDemoScope();
    const stations = await this.prisma.preparationStation.findMany({
      where: { tenantId: scope.tenantId, branchId: scope.branchId },
      orderBy: { name: "asc" }
    });

    return stations.map(toPreparationStationView);
  }

  async createPreparationStation(
    scope: RequestScope,
    input: CreatePreparationStationInput
  ): Promise<PreparationStationView> {
    if (!this.prismaService.isAvailable()) {
      return { id: randomUUID(), name: input.name, active: input.active };
    }

    await this.ensureDemoScope();
    const station = await this.prisma.preparationStation.create({
      data: {
        tenantId: scope.tenantId,
        branchId: scope.branchId,
        name: input.name,
        active: input.active
      }
    });
    await this.audit(scope, "preparation_station.created", {
      stationId: station.id,
      name: station.name
    });

    return toPreparationStationView(station);
  }

  async updatePreparationStation(
    scope: RequestScope,
    stationId: string,
    input: UpdatePreparationStationInput
  ): Promise<PreparationStationView> {
    if (!this.prismaService.isAvailable()) {
      return {
        id: stationId,
        name: input.name ?? "Setor",
        active: input.active ?? true
      };
    }

    await this.ensureDemoScope();
    await this.mustPreparationStation(scope, stationId);
    const station = await this.prisma.preparationStation.update({
      where: { id: stationId },
      data: input
    });
    await this.audit(scope, "preparation_station.updated", {
      stationId,
      changes: input
    });

    return toPreparationStationView(station);
  }

  async listTables(scope: RequestScope): Promise<ServiceTableView[]> {
    if (!this.prismaService.isAvailable()) {
      return demoTables();
    }

    await this.ensureDemoScope();
    const tables = await this.prisma.serviceTable.findMany({
      where: { tenantId: scope.tenantId, branchId: scope.branchId },
      orderBy: { name: "asc" }
    });

    return tables.map(toServiceTableView);
  }

  async createTable(
    scope: RequestScope,
    input: CreateTableInput
  ): Promise<ServiceTableView> {
    if (!this.prismaService.isAvailable()) {
      return {
        id: randomUUID(),
        name: input.name,
        status: ServiceTableStatus.AVAILABLE,
        active: input.active
      };
    }

    await this.ensureDemoScope();
    const table = await this.prisma.serviceTable.create({
      data: {
        tenantId: scope.tenantId,
        branchId: scope.branchId,
        name: input.name,
        active: input.active,
        status: ServiceTableStatus.AVAILABLE
      }
    });
    await this.audit(scope, "table.created", {
      tableId: table.id,
      name: table.name
    });

    return toServiceTableView(table);
  }

  async listTabs(scope: RequestScope): Promise<CustomerTabView[]> {
    if (!this.prismaService.isAvailable()) {
      return [];
    }

    await this.ensureDemoScope();
    const tabs = await this.prisma.customerTab.findMany({
      where: { tenantId: scope.tenantId, branchId: scope.branchId },
      orderBy: { displayNumber: "asc" }
    });

    return tabs.map(toCustomerTabView);
  }

  async createTab(scope: RequestScope, input: CreateTabInput): Promise<CustomerTabView> {
    if (!this.prismaService.isAvailable()) {
      return {
        id: randomUUID(),
        displayNumber: input.displayNumber,
        customerLabel: input.customerLabel ?? null,
        status: CustomerTabStatus.OPEN
      };
    }

    await this.ensureDemoScope();
    const tab = await this.prisma.customerTab.create({
      data: {
        tenantId: scope.tenantId,
        branchId: scope.branchId,
        displayNumber: input.displayNumber,
        customerLabel: input.customerLabel ?? null,
        status: CustomerTabStatus.OPEN
      }
    });
    await this.audit(scope, "tab.created", {
      tabId: tab.id,
      displayNumber: tab.displayNumber
    });

    return toCustomerTabView(tab);
  }

  async listItems(scope: RequestScope, search?: string): Promise<ProductView[]> {
    if (!this.prismaService.isAvailable()) {
      return this.demoStore.listItems(search);
    }

    await this.ensureDemoScope();

    const products = await this.prisma.product.findMany({
      where: {
        tenantId: scope.tenantId,
        branchId: scope.branchId,
        ...(search
          ? {
              OR: [
                { name: { contains: search, mode: "insensitive" } },
                { sku: { contains: search, mode: "insensitive" } },
                { barcode: { contains: search, mode: "insensitive" } }
              ]
            }
          : {})
      },
      include: {
        images: {
          where: { isPrimary: true, archivedAt: null },
          orderBy: { createdAt: "desc" },
          take: 1
        }
      },
      orderBy: { name: "asc" }
    });

    const balances = await this.stockBalances(scope);

    return products.map((product) =>
      toProductView(product, balances.get(product.id) ?? 0)
    );
  }

  async createItem(
    scope: RequestScope,
    input: CreateItemInput
  ): Promise<ProductView> {
    if (!this.prismaService.isAvailable()) {
      return this.demoStore.createItem(input);
    }

    await this.ensureDemoScope();

    const product = await this.prisma.product.create({
      data: {
        tenantId: scope.tenantId,
        branchId: scope.branchId,
        name: input.name,
        sku: input.sku,
        barcode: input.barcode || null,
        category: input.category,
        unit: input.unit,
        priceCents: BigInt(input.salePriceCents),
        averageCostCents: BigInt(input.costPriceCents),
        minStock: input.minStock.toString(),
        preparationStationId: input.preparationStationId ?? null,
        ageRestricted: input.ageRestricted,
        active: input.active
      }
    });

    await this.audit(scope, "product.created", {
      productId: product.id,
      sku: product.sku
    });

    return toProductView(product, 0);
  }

  async getProduct(scope: RequestScope, productId: string): Promise<ProductView> {
    if (!this.prismaService.isAvailable()) {
      const product = this.demoStore.listItems().find((item) => item.id === productId);
      if (!product) {
        throw new NotFoundException("Product not found.");
      }

      return product;
    }

    await this.ensureDemoScope();
    const product = await this.prisma.product.findFirst({
      where: { id: productId, tenantId: scope.tenantId, branchId: scope.branchId },
      include: {
        images: {
          where: { isPrimary: true, archivedAt: null },
          orderBy: { createdAt: "desc" },
          take: 1
        }
      }
    });

    if (!product) {
      throw new NotFoundException("Product not found.");
    }

    const balance = await this.stockBalanceForProduct(this.prisma, scope, product.id);
    return toProductView(product, balance);
  }

  async updateProduct(
    scope: RequestScope,
    productId: string,
    input: UpdateProductInput
  ): Promise<ProductView> {
    if (!this.prismaService.isAvailable()) {
      throw new BadRequestException("Product updates require the database-backed API.");
    }

    await this.ensureDemoScope();
    const existing = await this.prisma.product.findFirst({
      where: { id: productId, tenantId: scope.tenantId, branchId: scope.branchId }
    });

    if (!existing) {
      throw new NotFoundException("Product not found.");
    }

    const product = await this.prisma.product.update({
      where: { id: productId },
      data: {
        name: input.name,
        sku: input.sku,
        barcode: input.barcode,
        category: input.category,
        unit: input.unit,
        priceCents:
          input.salePriceCents === undefined
            ? undefined
            : BigInt(input.salePriceCents),
        averageCostCents:
          input.costPriceCents === undefined
            ? undefined
            : BigInt(input.costPriceCents),
        minStock:
          input.minStock === undefined ? undefined : input.minStock.toString(),
        preparationStationId: input.preparationStationId,
        ageRestricted: input.ageRestricted,
        active: input.active
      },
      include: {
        images: {
          where: { isPrimary: true, archivedAt: null },
          orderBy: { createdAt: "desc" },
          take: 1
        }
      }
    });

    await this.audit(scope, "product.updated", {
      productId,
      changes: input
    });

    const balance = await this.stockBalanceForProduct(this.prisma, scope, product.id);
    return toProductView(product, balance);
  }

  async archiveProduct(scope: RequestScope, productId: string): Promise<ProductView> {
    return this.updateProduct(scope, productId, { active: false });
  }

  async updateProductAvailability(
    scope: RequestScope,
    productId: string,
    input: UpdateProductAvailabilityInput
  ): Promise<ProductView> {
    return this.updateProduct(scope, productId, { active: input.active });
  }

  async listOrders(scope: RequestScope): Promise<OrderView[]> {
    if (!this.prismaService.isAvailable()) {
      return [];
    }

    await this.ensureDemoScope();
    const orders = await this.prisma.order.findMany({
      where: { tenantId: scope.tenantId, branchId: scope.branchId },
      include: orderInclude,
      orderBy: { createdAt: "desc" },
      take: 50
    });

    return orders.map(toOrderView);
  }

  async getOrder(scope: RequestScope, orderId: string): Promise<OrderView> {
    if (!this.prismaService.isAvailable()) {
      throw new NotFoundException("Order not found.");
    }

    await this.ensureDemoScope();
    const order = await this.prisma.order.findFirst({
      where: { id: orderId, tenantId: scope.tenantId, branchId: scope.branchId },
      include: orderInclude
    });

    if (!order) {
      throw new NotFoundException("Order not found.");
    }

    return toOrderView(order);
  }

  async createOrder(
    scope: RequestScope,
    input: CreateOrderInput,
    idempotencyKey?: string
  ): Promise<OrderView> {
    if (!this.prismaService.isAvailable()) {
      throw new BadRequestException("Orders require the database-backed API.");
    }

    await this.ensureDemoScope();
    const operation = async (tx: Tx) => {
      if (input.type === OrderType.TABLE && !input.tableId) {
        throw new BadRequestException("tableId is required for table orders.");
      }

      if (input.type === OrderType.TAB && !input.tabId) {
        throw new BadRequestException("tabId is required for tab orders.");
      }

      if (input.tableId) {
        await this.mustTable(tx, scope, input.tableId);
      }

      if (input.tabId) {
        await this.mustTab(tx, scope, input.tabId);
      }

      const order = await tx.order.create({
        data: {
          tenantId: scope.tenantId,
          branchId: scope.branchId,
          userId: scope.userId,
          clientCommandId: idempotencyKey ?? null,
          type: input.type as OrderType,
          tableId: input.tableId ?? null,
          tabId: input.tabId ?? null,
          status: OrderStatus.DRAFT,
          subtotalCents: 0n,
          discountCents: 0n,
          totalCents: 0n,
          costOfGoodsCents: 0n
        }
      });

      if (input.tableId) {
        await tx.serviceTable.update({
          where: { id: input.tableId },
          data: { status: ServiceTableStatus.OCCUPIED }
        });
      }

      await tx.orderStatusHistory.create({
        data: {
          tenantId: scope.tenantId,
          orderId: order.id,
          fromStatus: null,
          toStatus: OrderStatus.DRAFT,
          actorId: scope.userId
        }
      });

      await tx.auditLog.create({
        data: {
          tenantId: scope.tenantId,
          branchId: scope.branchId,
          actorUserId: scope.userId,
          orderId: order.id,
          action: "order.created",
          correlationId: scope.correlationId,
          payload: {
            type: order.type,
            tableId: order.tableId,
            tabId: order.tabId
          }
        }
      });

      return await this.readOrder(tx, scope, order.id);
    };

    if (idempotencyKey) {
      return await this.withIdempotency(scope, idempotencyKey, "orders.create", input, operation);
    }

    return await this.prisma.$transaction(operation);
  }

  async addOrderItem(
    scope: RequestScope,
    orderId: string,
    input: AddOrderItemInput
  ): Promise<OrderView> {
    if (!this.prismaService.isAvailable()) {
      throw new BadRequestException("Orders require the database-backed API.");
    }

    await this.ensureDemoScope();

    return await this.prisma.$transaction(async (tx) => {
      const order = await this.mustOpenOrder(tx, scope, orderId);
      const product = await tx.product.findFirst({
        where: {
          id: input.productId,
          tenantId: scope.tenantId,
          branchId: scope.branchId,
          active: true
        }
      });

      if (!product) {
        throw new NotFoundException("Product not found.");
      }

      const quantity = BigInt(input.quantity);
      await tx.orderItem.create({
        data: {
          tenantId: scope.tenantId,
          branchId: scope.branchId,
          orderId: order.id,
          productId: product.id,
          quantity: input.quantity.toString(),
          unitPriceCents: product.priceCents,
          totalCents: product.priceCents * quantity,
          unitCostCents: product.averageCostCents,
          totalCostCents: product.averageCostCents * quantity,
          status: OrderItemStatus.DRAFT,
          preparationStationId: product.preparationStationId,
          note: input.note ?? null
        }
      });

      await this.recalculateOrderTotals(tx, scope, order.id);
      await tx.auditLog.create({
        data: {
          tenantId: scope.tenantId,
          branchId: scope.branchId,
          actorUserId: scope.userId,
          orderId: order.id,
          action: "order.item_added",
          correlationId: scope.correlationId,
          payload: {
            productId: product.id,
            quantity: input.quantity
          }
        }
      });

      return await this.readOrder(tx, scope, order.id);
    });
  }

  async updateOrderItem(
    scope: RequestScope,
    orderId: string,
    itemId: string,
    input: UpdateOrderItemInput
  ): Promise<OrderView> {
    if (!this.prismaService.isAvailable()) {
      throw new BadRequestException("Orders require the database-backed API.");
    }

    await this.ensureDemoScope();

    return await this.prisma.$transaction(async (tx) => {
      const order = await this.mustOpenOrder(tx, scope, orderId);
      const item = await tx.orderItem.findFirst({
        where: {
          id: itemId,
          tenantId: scope.tenantId,
          branchId: scope.branchId,
          orderId: order.id
        },
        include: { product: true }
      });

      if (!item) {
        throw new NotFoundException("Order item not found.");
      }

      const quantity = input.quantity ?? Number(item.quantity);
      const quantityBigInt = BigInt(quantity);
      await tx.orderItem.update({
        where: { id: item.id },
        data: {
          quantity: quantity.toString(),
          totalCents: item.unitPriceCents * quantityBigInt,
          totalCostCents: item.unitCostCents * quantityBigInt,
          note: input.note === undefined ? item.note : input.note
        }
      });

      await this.recalculateOrderTotals(tx, scope, order.id);
      await tx.auditLog.create({
        data: {
          tenantId: scope.tenantId,
          branchId: scope.branchId,
          actorUserId: scope.userId,
          orderId: order.id,
          action: "order.item_updated",
          correlationId: scope.correlationId,
          payload: {
            itemId: item.id,
            changes: input
          }
        }
      });

      return await this.readOrder(tx, scope, order.id);
    });
  }

  async submitOrder(
    scope: RequestScope,
    orderId: string,
    idempotencyKey?: string
  ): Promise<OrderView> {
    if (!this.prismaService.isAvailable()) {
      throw new BadRequestException("Orders require the database-backed API.");
    }

    await this.ensureDemoScope();
    const key = idempotencyKey ?? `order-submit-${orderId}`;

    return await this.withIdempotency(scope, key, "orders.submit", { orderId }, async (tx) => {
      const order = await this.mustOpenOrder(tx, scope, orderId);
      const items = await tx.orderItem.findMany({
        where: {
          tenantId: scope.tenantId,
          branchId: scope.branchId,
          orderId: order.id,
          status: OrderItemStatus.DRAFT
        },
        include: { product: true }
      });

      if (items.length === 0) {
        throw new BadRequestException("Order has no draft items to submit.");
      }

      await tx.orderItem.updateMany({
        where: {
          tenantId: scope.tenantId,
          branchId: scope.branchId,
          orderId: order.id,
          status: OrderItemStatus.DRAFT
        },
        data: { status: OrderItemStatus.SENT }
      });

      const previousStatus = order.status;
      if (order.status === OrderStatus.DRAFT) {
        await tx.order.update({
          where: { id: order.id },
          data: {
            status: OrderStatus.CONFIRMED,
            version: { increment: 1 }
          }
        });
        await tx.orderStatusHistory.create({
          data: {
            tenantId: scope.tenantId,
            orderId: order.id,
            fromStatus: previousStatus,
            toStatus: OrderStatus.CONFIRMED,
            actorId: scope.userId
          }
        });
      }

      const byStation = new Map<string, typeof items>();
      for (const item of items) {
        if (!item.preparationStationId) {
          continue;
        }

        byStation.set(item.preparationStationId, [
          ...(byStation.get(item.preparationStationId) ?? []),
          item
        ]);
      }

      for (const [stationId, stationItems] of byStation.entries()) {
        const ticket = await tx.preparationTicket.create({
          data: {
            tenantId: scope.tenantId,
            branchId: scope.branchId,
            stationId,
            orderId: order.id,
            status: PreparationTicketStatus.PENDING
          }
        });

        for (const item of stationItems) {
          await tx.preparationTicketItem.create({
            data: {
              tenantId: scope.tenantId,
              ticketId: ticket.id,
              orderItemId: item.id,
              quantity: item.quantity,
              status: PreparationTicketStatus.PENDING
            }
          });
        }
      }

      await tx.auditLog.create({
        data: {
          tenantId: scope.tenantId,
          branchId: scope.branchId,
          actorUserId: scope.userId,
          orderId: order.id,
          action: "order.submitted",
          correlationId: scope.correlationId,
          payload: {
            itemCount: items.length,
            stationCount: byStation.size
          }
        }
      });

      return await this.readOrder(tx, scope, order.id);
    });
  }

  async requestCloseOrder(scope: RequestScope, orderId: string): Promise<OrderView> {
    if (!this.prismaService.isAvailable()) {
      throw new BadRequestException("Orders require the database-backed API.");
    }

    await this.ensureDemoScope();

    return await this.prisma.$transaction(async (tx) => {
      const order = await this.mustOpenOrder(tx, scope, orderId);
      if (order.tabId) {
        await tx.customerTab.update({
          where: { id: order.tabId },
          data: { status: CustomerTabStatus.REQUESTED_CLOSE }
        });
      }

      await tx.auditLog.create({
        data: {
          tenantId: scope.tenantId,
          branchId: scope.branchId,
          actorUserId: scope.userId,
          orderId: order.id,
          action: "order.close_requested",
          correlationId: scope.correlationId,
          payload: {
            tabId: order.tabId,
            tableId: order.tableId
          }
        }
      });

      return await this.readOrder(tx, scope, order.id);
    });
  }

  async completeOrder(
    scope: RequestScope,
    orderId: string,
    input: CompleteOrderInput,
    idempotencyKey?: string
  ): Promise<{
    readonly orderId: string;
    readonly totalCents: string;
    readonly costOfGoodsCents: string;
    readonly grossProfitCents: string;
    readonly paymentMethod: string;
    readonly items: readonly { readonly name: string; readonly quantity: string }[];
  }> {
    if (!this.prismaService.isAvailable()) {
      throw new BadRequestException("Orders require the database-backed API.");
    }

    if (!idempotencyKey) {
      throw new BadRequestException("Idempotency-Key header is required.");
    }

    await this.ensureDemoScope();

    return await this.withIdempotency(scope, idempotencyKey, "orders.complete", { orderId, input }, async (tx) => {
      const order = await tx.order.findFirst({
        where: {
          id: orderId,
          tenantId: scope.tenantId,
          branchId: scope.branchId,
          status: { in: [OrderStatus.DRAFT, OrderStatus.CONFIRMED] }
        },
        include: {
          items: { include: { product: true } }
        }
      });

      if (!order) {
        throw new NotFoundException("Open order not found.");
      }

      if (order.items.length === 0) {
        throw new BadRequestException("Order has no items.");
      }

      if (BigInt(input.payment.amountCents) < order.totalCents) {
        throw new BadRequestException("Payment amount is lower than order total.");
      }

      for (const item of order.items) {
        const balance = await this.stockBalanceForProduct(tx, scope, item.productId);
        if (balance < Number(item.quantity)) {
          throw new ConflictException(`Insufficient stock for ${item.product.name}.`);
        }
      }

      for (const item of order.items) {
        await tx.stockMovement.create({
          data: {
            tenantId: scope.tenantId,
            branchId: scope.branchId,
            productId: item.productId,
            orderId: order.id,
            type: StockMovementType.SALE_CONSUMPTION,
            quantity: (-Number(item.quantity)).toString(),
            unitCostCents: item.unitCostCents,
            reason: "Pedido concluido"
          }
        });
      }

      const paymentRecord = await tx.paymentRecord.create({
        data: {
          tenantId: scope.tenantId,
          branchId: scope.branchId,
          orderId: order.id,
          method: input.payment.method,
          status: PaymentStatus.RECORDED,
          grossCents: order.totalCents,
          estimatedFeeCents: 0n,
          netCents: order.totalCents,
          expectedSettlementDate: new Date()
        }
      });

      await tx.financialEntry.create({
        data: {
          tenantId: scope.tenantId,
          branchId: scope.branchId,
          orderId: order.id,
          type: FinancialEntryType.CASH_IN,
          amountCents: order.totalCents,
          competenceDate: new Date(),
          settlementDate: new Date(),
          memo: `Pedido ${order.id}`
        }
      });

      await this.recordManagerSale(tx, scope, {
        orderId: order.id,
        totalCents: order.totalCents,
        costOfGoodsCents: order.costOfGoodsCents,
        paymentRecordId: paymentRecord.id,
        paymentMethod: input.payment.method
      });

      const now = new Date();
      await tx.order.update({
        where: { id: order.id },
        data: {
          status: OrderStatus.COMPLETED,
          closedAt: now,
          completedAt: now,
          version: { increment: 1 }
        }
      });

      await tx.orderStatusHistory.create({
        data: {
          tenantId: scope.tenantId,
          orderId: order.id,
          fromStatus: order.status,
          toStatus: OrderStatus.COMPLETED,
          actorId: scope.userId
        }
      });

      if (order.tableId) {
        await tx.serviceTable.update({
          where: { id: order.tableId },
          data: { status: ServiceTableStatus.AVAILABLE }
        });
      }

      if (order.tabId) {
        await tx.customerTab.update({
          where: { id: order.tabId },
          data: { status: CustomerTabStatus.CLOSED }
        });
      }

      await tx.auditLog.create({
        data: {
          tenantId: scope.tenantId,
          branchId: scope.branchId,
          actorUserId: scope.userId,
          orderId: order.id,
          action: "order.completed",
          correlationId: scope.correlationId,
          payload: {
            totalCents: order.totalCents.toString(),
            costOfGoodsCents: order.costOfGoodsCents.toString(),
            paymentMethod: input.payment.method
          }
        }
      });

      return {
        orderId: order.id,
        totalCents: order.totalCents.toString(),
        costOfGoodsCents: order.costOfGoodsCents.toString(),
        grossProfitCents: (order.totalCents - order.costOfGoodsCents).toString(),
        paymentMethod: input.payment.method,
        items: order.items.map((item) => ({
          name: item.product.name,
          quantity: item.quantity.toString()
        }))
      };
    });
  }

  async listPreparationTickets(
    scope: RequestScope,
    stationId?: string
  ): Promise<PreparationTicketView[]> {
    if (!this.prismaService.isAvailable()) {
      return [];
    }

    await this.ensureDemoScope();
    const tickets = await this.prisma.preparationTicket.findMany({
      where: {
        tenantId: scope.tenantId,
        branchId: scope.branchId,
        ...(stationId ? { stationId } : {}),
        status: { notIn: [PreparationTicketStatus.READY, PreparationTicketStatus.CANCELLED] }
      },
      include: preparationTicketInclude,
      orderBy: { receivedAt: "asc" }
    });

    return tickets.map(toPreparationTicketView);
  }

  async advancePreparationTicket(
    scope: RequestScope,
    ticketId: string,
    action: "ack" | "start" | "ready" | "issues"
  ): Promise<PreparationTicketView> {
    if (!this.prismaService.isAvailable()) {
      throw new BadRequestException("Preparation tickets require the database-backed API.");
    }

    await this.ensureDemoScope();
    return await this.prisma.$transaction(async (tx) => {
      const ticket = await tx.preparationTicket.findFirst({
        where: {
          id: ticketId,
          tenantId: scope.tenantId,
          branchId: scope.branchId
        },
        include: preparationTicketInclude
      });

      if (!ticket) {
        throw new NotFoundException("Preparation ticket not found.");
      }

      const nextStatus = preparationStatusForAction(action);
      const now = new Date();
      await tx.preparationTicket.update({
        where: { id: ticket.id },
        data: {
          status: nextStatus,
          startedAt:
            action === "start" && !ticket.startedAt ? now : ticket.startedAt,
          readyAt: action === "ready" ? now : ticket.readyAt
        }
      });
      await tx.preparationTicketItem.updateMany({
        where: { tenantId: scope.tenantId, ticketId: ticket.id },
        data: { status: nextStatus }
      });

      if (action === "start" || action === "ready") {
        await tx.orderItem.updateMany({
          where: {
            tenantId: scope.tenantId,
            id: { in: ticket.items.map((item) => item.orderItemId) }
          },
          data: {
            status:
              action === "ready"
                ? OrderItemStatus.READY
                : OrderItemStatus.PREPARING
          }
        });
      }

      await tx.auditLog.create({
        data: {
          tenantId: scope.tenantId,
          branchId: scope.branchId,
          actorUserId: scope.userId,
          orderId: ticket.orderId,
          action: `preparation_ticket.${action}`,
          correlationId: scope.correlationId,
          payload: { ticketId: ticket.id, nextStatus }
        }
      });

      const updated = await tx.preparationTicket.findFirstOrThrow({
        where: { id: ticket.id },
        include: preparationTicketInclude
      });

      return toPreparationTicketView(updated);
    });
  }

  async createInventoryMovement(
    scope: RequestScope,
    input: StockMovementInput,
    idempotencyKey?: string
  ): Promise<{ readonly movementId: string; readonly balance: string }> {
    if (!this.prismaService.isAvailable()) {
      return this.demoStore.createInventoryMovement(input, idempotencyKey);
    }

    await this.ensureDemoScope();
    const key = idempotencyKey ?? `inventory-${input.itemId}-${Date.now()}`;

    return await this.withIdempotency(scope, key, "inventory.movement", input, async (tx) => {
      const product = await tx.product.findFirst({
        where: {
          id: input.itemId,
          tenantId: scope.tenantId,
          branchId: scope.branchId
        }
      });

      if (!product) {
        throw new NotFoundException("Product not found.");
      }

      const quantity = normalizeMovementQuantity(input.type, input.quantity);
      const movement = await tx.stockMovement.create({
        data: {
          tenantId: scope.tenantId,
          branchId: scope.branchId,
          productId: product.id,
          type:
            input.type === "INITIAL_BALANCE"
              ? StockMovementType.INITIAL_BALANCE
              : StockMovementType.ADJUSTMENT,
          quantity: quantity.toString(),
          unitCostCents: BigInt(input.unitCostCents ?? Number(product.averageCostCents)),
          reason: input.reason
        }
      });

      await tx.auditLog.create({
        data: {
          tenantId: scope.tenantId,
          branchId: scope.branchId,
          actorUserId: scope.userId,
          action: "inventory.movement.created",
          correlationId: scope.correlationId,
          payload: {
            movementId: movement.id,
            productId: product.id,
            quantity: quantity.toString(),
            reason: input.reason
          }
        }
      });

      const balance = await this.stockBalanceForProduct(tx, scope, product.id);
      return {
        movementId: movement.id,
        balance: balance.toString()
      };
    });
  }

  async inventoryMovements(scope: RequestScope): Promise<
    Array<{
      readonly id: string;
      readonly productId: string;
      readonly productName: string;
      readonly orderId: string | null;
      readonly type: string;
      readonly quantity: string;
      readonly unitCostCents: string;
      readonly reason: string | null;
      readonly createdAt: string;
    }>
  > {
    if (!this.prismaService.isAvailable()) {
      return [];
    }

    await this.ensureDemoScope();
    const movements = await this.prisma.stockMovement.findMany({
      where: { tenantId: scope.tenantId, branchId: scope.branchId },
      include: { product: true },
      orderBy: { createdAt: "desc" },
      take: 100
    });

    return movements.map((movement) => ({
      id: movement.id,
      productId: movement.productId,
      productName: movement.product.name,
      orderId: movement.orderId,
      type: movement.type,
      quantity: movement.quantity.toString(),
      unitCostCents: movement.unitCostCents.toString(),
      reason: movement.reason,
      createdAt: movement.createdAt.toISOString()
    }));
  }

  async inventoryBalances(scope: RequestScope): Promise<
    Array<{
      readonly itemId: string;
      readonly name: string;
      readonly sku: string;
      readonly quantityOnHand: string;
      readonly minStock: string;
      readonly status: "normal" | "low" | "zero";
      readonly lastMovementAt: string | null;
    }>
  > {
    if (!this.prismaService.isAvailable()) {
      return this.demoStore.inventoryBalances();
    }

    await this.ensureDemoScope();
    const products = await this.prisma.product.findMany({
      where: { tenantId: scope.tenantId, branchId: scope.branchId },
      orderBy: { name: "asc" }
    });

    const balances = await this.stockBalances(scope);
    const lastMovements = await this.prisma.stockMovement.groupBy({
      by: ["productId"],
      where: { tenantId: scope.tenantId, branchId: scope.branchId },
      _max: { createdAt: true }
    });
    const lastByProduct = new Map(
      lastMovements.map((entry) => [
        entry.productId,
        entry._max.createdAt?.toISOString() ?? null
      ])
    );

    return products.map((product) => {
      const balance = balances.get(product.id) ?? 0;
      const minStock = Number(product.minStock);

      return {
        itemId: product.id,
        name: product.name,
        sku: product.sku,
        quantityOnHand: balance.toString(),
        minStock: minStock.toString(),
        status: stockStatus(balance, minStock),
        lastMovementAt: lastByProduct.get(product.id) ?? null
      };
    });
  }

  async finalizeSale(
    scope: RequestScope,
    input: FinalizeSaleInput,
    idempotencyKey?: string
  ): Promise<{
    readonly orderId: string;
    readonly totalCents: string;
    readonly costOfGoodsCents: string;
    readonly grossProfitCents: string;
    readonly paymentMethod: string;
    readonly items: readonly { readonly name: string; readonly quantity: string }[];
  }> {
    if (!this.prismaService.isAvailable()) {
      return this.demoStore.finalizeSale(input, idempotencyKey) as {
        readonly orderId: string;
        readonly totalCents: string;
        readonly costOfGoodsCents: string;
        readonly grossProfitCents: string;
        readonly paymentMethod: string;
        readonly items: readonly { readonly name: string; readonly quantity: string }[];
      };
    }

    if (!idempotencyKey) {
      throw new BadRequestException("Idempotency-Key header is required.");
    }

    await this.ensureDemoScope();

    return await this.withIdempotency(scope, idempotencyKey, "sales.finalize", input, async (tx) => {
      const productIds = input.items.map((item) => item.itemId);
      const products = await tx.product.findMany({
        where: {
          id: { in: productIds },
          tenantId: scope.tenantId,
          branchId: scope.branchId,
          active: true
        }
      });

      if (products.length !== productIds.length) {
        throw new NotFoundException("One or more products were not found.");
      }

      const productsById = new Map(products.map((product) => [product.id, product]));
      let subtotalCents = 0n;
      let costOfGoodsCents = 0n;

      for (const item of input.items) {
        const product = productsById.get(item.itemId);
        if (!product) {
          throw new NotFoundException("Product not found.");
        }

        const balance = await this.stockBalanceForProduct(tx, scope, product.id);
        if (balance < item.quantity) {
          throw new ConflictException(`Insufficient stock for ${product.name}.`);
        }

        subtotalCents += product.priceCents * BigInt(item.quantity);
        costOfGoodsCents += product.averageCostCents * BigInt(item.quantity);
      }

      if (BigInt(input.payment.amountCents) < subtotalCents) {
        throw new BadRequestException("Payment amount is lower than sale total.");
      }

      const order = await tx.order.create({
        data: {
          tenantId: scope.tenantId,
          branchId: scope.branchId,
          userId: scope.userId,
          clientCommandId: idempotencyKey,
          status: OrderStatus.COMPLETED,
          subtotalCents,
          discountCents: 0n,
          totalCents: subtotalCents,
          costOfGoodsCents,
          completedAt: new Date()
        }
      });

      for (const item of input.items) {
        const product = productsById.get(item.itemId);
        if (!product) {
          throw new NotFoundException("Product not found.");
        }

        await tx.orderItem.create({
          data: {
            tenantId: scope.tenantId,
            branchId: scope.branchId,
            orderId: order.id,
            productId: product.id,
            quantity: item.quantity.toString(),
            unitPriceCents: product.priceCents,
            totalCents: product.priceCents * BigInt(item.quantity),
            unitCostCents: product.averageCostCents,
            totalCostCents: product.averageCostCents * BigInt(item.quantity)
          }
        });

        await tx.stockMovement.create({
          data: {
            tenantId: scope.tenantId,
            branchId: scope.branchId,
            productId: product.id,
            orderId: order.id,
            type: StockMovementType.SALE_CONSUMPTION,
            quantity: (-item.quantity).toString(),
            unitCostCents: product.averageCostCents,
            reason: "Venda finalizada"
          }
        });
      }

      const paymentRecord = await tx.paymentRecord.create({
        data: {
          tenantId: scope.tenantId,
          branchId: scope.branchId,
          orderId: order.id,
          method: input.payment.method,
          status: PaymentStatus.RECORDED,
          grossCents: subtotalCents,
          estimatedFeeCents: 0n,
          netCents: subtotalCents,
          expectedSettlementDate: new Date()
        }
      });

      await tx.financialEntry.create({
        data: {
          tenantId: scope.tenantId,
          branchId: scope.branchId,
          orderId: order.id,
          type: FinancialEntryType.CASH_IN,
          amountCents: subtotalCents,
          competenceDate: new Date(),
          settlementDate: new Date(),
          memo: `Venda ${order.id}`
        }
      });

      await this.recordManagerSale(tx, scope, {
        orderId: order.id,
        totalCents: subtotalCents,
        costOfGoodsCents,
        paymentRecordId: paymentRecord.id,
        paymentMethod: input.payment.method
      });

      await tx.auditLog.create({
        data: {
          tenantId: scope.tenantId,
          branchId: scope.branchId,
          actorUserId: scope.userId,
          orderId: order.id,
          action: "sale.finalized",
          correlationId: scope.correlationId,
          payload: {
            totalCents: subtotalCents.toString(),
            costOfGoodsCents: costOfGoodsCents.toString(),
            paymentMethod: input.payment.method
          }
        }
      });

      return {
        orderId: order.id,
        totalCents: subtotalCents.toString(),
        costOfGoodsCents: costOfGoodsCents.toString(),
        grossProfitCents: (subtotalCents - costOfGoodsCents).toString(),
        paymentMethod: input.payment.method,
        items: input.items.map((item) => ({
          name: productsById.get(item.itemId)?.name ?? "Produto",
          quantity: item.quantity.toString()
        }))
      };
    });
  }

  async dashboard(
    scope: RequestScope,
    filters: { readonly end?: string; readonly start?: string } = {}
  ): Promise<{
    readonly revenueCents: string;
    readonly cogsCents: string;
    readonly grossProfitCents: string;
    readonly salesCount: number;
    readonly averageTicketCents: string;
    readonly lowStockCount: number;
    readonly series: readonly {
      readonly date: string;
      readonly revenueCents: string;
      readonly cogsCents: string;
      readonly grossProfitCents: string;
    }[];
    readonly topProducts: readonly {
      readonly name: string;
      readonly quantity: string;
      readonly revenueCents: string;
    }[];
    readonly recentSales: readonly {
      readonly orderId: string;
      readonly totalCents: string;
      readonly paymentMethod: string;
      readonly completedAt: string;
    }[];
  }> {
    if (!this.prismaService.isAvailable()) {
      return this.demoStore.dashboard(filters);
    }

    await this.ensureDemoScope();
    const since = filters.start ? new Date(`${filters.start}T00:00:00.000Z`) : new Date();
    if (!filters.start) {
      since.setDate(since.getDate() - 30);
    }
    const until = filters.end ? new Date(`${filters.end}T23:59:59.999Z`) : undefined;

    const orders = await this.prisma.order.findMany({
      where: {
        tenantId: scope.tenantId,
        branchId: scope.branchId,
        status: OrderStatus.COMPLETED,
        completedAt: { gte: since, ...(until ? { lte: until } : {}) }
      },
      include: {
        items: { include: { product: true } },
        paymentRecords: true
      },
      orderBy: { completedAt: "desc" }
    });

    const revenue = orders.reduce((sum, order) => sum + order.totalCents, 0n);
    const cogs = orders.reduce((sum, order) => sum + order.costOfGoodsCents, 0n);
    const byDay = new Map<string, { revenue: bigint; cogs: bigint }>();
    const top = new Map<string, { name: string; quantity: number; revenue: bigint }>();

    for (const order of orders) {
      const key = (order.completedAt ?? order.createdAt).toISOString().slice(0, 10);
      const current = byDay.get(key) ?? { revenue: 0n, cogs: 0n };
      current.revenue += order.totalCents;
      current.cogs += order.costOfGoodsCents;
      byDay.set(key, current);

      for (const item of order.items) {
        const currentTop = top.get(item.productId) ?? {
          name: item.product.name,
          quantity: 0,
          revenue: 0n
        };
        currentTop.quantity += Number(item.quantity);
        currentTop.revenue += item.totalCents;
        top.set(item.productId, currentTop);
      }
    }

    const balances = await this.inventoryBalances(scope);
    const lowStockCount = balances.filter((balance) => balance.status !== "normal").length;

    return {
      revenueCents: revenue.toString(),
      cogsCents: cogs.toString(),
      grossProfitCents: (revenue - cogs).toString(),
      salesCount: orders.length,
      averageTicketCents:
        orders.length > 0 ? (revenue / BigInt(orders.length)).toString() : "0",
      lowStockCount,
      series: Array.from(byDay.entries())
        .sort(([left], [right]) => left.localeCompare(right))
        .map(([date, value]) => ({
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
      recentSales: orders.slice(0, 8).map((order) => ({
        orderId: order.id,
        totalCents: order.totalCents.toString(),
        paymentMethod: order.paymentRecords[0]?.method ?? "manual",
        completedAt: (order.completedAt ?? order.createdAt).toISOString()
      }))
    };
  }

  async listSales(scope: RequestScope): Promise<
    Array<{
      readonly orderId: string;
      readonly status: string;
      readonly totalCents: string;
      readonly costOfGoodsCents: string;
      readonly grossProfitCents: string;
      readonly paymentMethod: string;
      readonly completedAt: string | null;
      readonly itemCount: number;
    }>
  > {
    if (!this.prismaService.isAvailable()) {
      return this.demoStore.dashboard().recentSales.map((sale) => ({
        orderId: sale.orderId,
        status: "COMPLETED",
        totalCents: sale.totalCents,
        costOfGoodsCents: "0",
        grossProfitCents: "0",
        paymentMethod: sale.paymentMethod,
        completedAt: sale.completedAt,
        itemCount: 0
      }));
    }

    await this.ensureDemoScope();
    const orders = await this.prisma.order.findMany({
      where: {
        tenantId: scope.tenantId,
        branchId: scope.branchId,
        status: { in: [OrderStatus.COMPLETED, OrderStatus.CANCELLED] }
      },
      include: {
        items: true,
        paymentRecords: true
      },
      orderBy: { updatedAt: "desc" },
      take: 100
    });

    return orders.map((order) => ({
      orderId: order.id,
      status: order.status,
      totalCents: order.totalCents.toString(),
      costOfGoodsCents: order.costOfGoodsCents.toString(),
      grossProfitCents: (order.totalCents - order.costOfGoodsCents).toString(),
      paymentMethod: order.paymentRecords[0]?.method ?? "manual",
      completedAt: order.completedAt?.toISOString() ?? null,
      itemCount: order.items.length
    }));
  }

  async getSale(scope: RequestScope, orderId: string): Promise<OrderView> {
    return this.getOrder(scope, orderId);
  }

  async cancelSale(
    scope: RequestScope,
    orderId: string,
    idempotencyKey?: string
  ): Promise<{ readonly orderId: string; readonly status: string }> {
    if (!this.prismaService.isAvailable()) {
      throw new BadRequestException("Sale cancellation requires the database-backed API.");
    }

    if (!idempotencyKey) {
      throw new BadRequestException("Idempotency-Key header is required.");
    }

    await this.ensureDemoScope();

    return await this.withIdempotency(scope, idempotencyKey, "sales.cancel", { orderId }, async (tx) => {
      const order = await tx.order.findFirst({
        where: {
          id: orderId,
          tenantId: scope.tenantId,
          branchId: scope.branchId,
          status: OrderStatus.COMPLETED
        },
        include: { items: true }
      });

      if (!order) {
        throw new NotFoundException("Completed sale not found.");
      }

      for (const item of order.items) {
        await tx.stockMovement.create({
          data: {
            tenantId: scope.tenantId,
            branchId: scope.branchId,
            productId: item.productId,
            orderId: order.id,
            type: StockMovementType.REVERSAL,
            quantity: item.quantity,
            unitCostCents: item.unitCostCents,
            reason: "Cancelamento de venda"
          }
        });
      }

      await tx.paymentRecord.updateMany({
        where: {
          tenantId: scope.tenantId,
          branchId: scope.branchId,
          orderId: order.id
        },
        data: { status: PaymentStatus.CANCELLED }
      });

      await tx.financialEntry.create({
        data: {
          tenantId: scope.tenantId,
          branchId: scope.branchId,
          orderId: order.id,
          type: FinancialEntryType.REVERSAL,
          amountCents: -order.totalCents,
          competenceDate: new Date(),
          settlementDate: new Date(),
          memo: `Cancelamento da venda ${order.id}`
        }
      });

      await tx.sale.updateMany({
        where: { tenantId: scope.tenantId, branchId: scope.branchId, orderId: order.id },
        data: { status: "CANCELLED" }
      });
      await tx.accountReceivable.updateMany({
        where: { tenantId: scope.tenantId, branchId: scope.branchId, sale: { orderId: order.id } },
        data: { status: "CANCELLED", openCents: 0n }
      });

      await tx.order.update({
        where: { id: order.id },
        data: { status: OrderStatus.CANCELLED, version: { increment: 1 } }
      });
      await tx.orderStatusHistory.create({
        data: {
          tenantId: scope.tenantId,
          orderId: order.id,
          fromStatus: OrderStatus.COMPLETED,
          toStatus: OrderStatus.CANCELLED,
          actorId: scope.userId
        }
      });
      await tx.auditLog.create({
        data: {
          tenantId: scope.tenantId,
          branchId: scope.branchId,
          actorUserId: scope.userId,
          orderId: order.id,
          action: "sale.cancelled",
          correlationId: scope.correlationId,
          payload: { orderId: order.id, reversalCents: order.totalCents.toString() }
        }
      });

      return { orderId: order.id, status: OrderStatus.CANCELLED };
    });
  }

  async auditEvents(scope: RequestScope): Promise<
    Array<{
      readonly id: string;
      readonly action: string;
      readonly createdAt: string;
      readonly payload: unknown;
    }>
  > {
    if (!this.prismaService.isAvailable()) {
      return this.demoStore.auditEvents();
    }

    await this.ensureDemoScope();
    const events = await this.prisma.auditLog.findMany({
      where: { tenantId: scope.tenantId, branchId: scope.branchId },
      orderBy: { createdAt: "desc" },
      take: 25
    });

    return events.map((event) => ({
      id: event.id,
      action: event.action,
      createdAt: event.createdAt.toISOString(),
      payload: event.payload
    }));
  }

  private get prisma(): PrismaClient {
    return this.prismaService.client;
  }

  private async withIdempotency<TResponse>(
    scope: RequestScope,
    key: string,
    operation: string,
    payload: unknown,
    handler: (tx: Tx) => Promise<TResponse>
  ): Promise<TResponse> {
    const requestHash = hashPayload(payload);
    const existing = await this.prisma.idempotencyRecord.findUnique({
      where: {
        tenantId_branchId_key: {
          tenantId: scope.tenantId,
          branchId: scope.branchId,
          key
        }
      }
    });

    if (existing?.responseBody) {
      if (existing.requestHash !== requestHash) {
        throw new ConflictException("Idempotency key was already used with a different payload.");
      }

      return existing.responseBody as TResponse;
    }

    return await this.prisma.$transaction(async (tx) => {
      await tx.idempotencyRecord.upsert({
        where: {
          tenantId_branchId_key: {
            tenantId: scope.tenantId,
            branchId: scope.branchId,
            key
          }
        },
        update: {
          requestHash,
          operation,
          lockedUntil: new Date(Date.now() + 60_000)
        },
        create: {
          tenantId: scope.tenantId,
          branchId: scope.branchId,
          key,
          operation,
          requestHash,
          lockedUntil: new Date(Date.now() + 60_000)
        }
      });

      const response = await handler(tx);
      await tx.idempotencyRecord.update({
        where: {
          tenantId_branchId_key: {
            tenantId: scope.tenantId,
            branchId: scope.branchId,
            key
          }
        },
        data: {
          responseBody: response as Prisma.InputJsonValue,
          statusCode: 200,
          lockedUntil: null
        }
      });

      return response;
    });
  }

  private async stockBalances(scope: RequestScope): Promise<Map<string, number>> {
    const movements = await this.prisma.stockMovement.groupBy({
      by: ["productId"],
      where: { tenantId: scope.tenantId, branchId: scope.branchId },
      _sum: { quantity: true }
    });

    return new Map(
      movements.map((movement) => [
        movement.productId,
        Number(movement._sum.quantity ?? 0)
      ])
    );
  }

  private async stockBalanceForProduct(
    tx: Tx,
    scope: RequestScope,
    productId: string
  ): Promise<number> {
    const result = await tx.stockMovement.aggregate({
      where: {
        tenantId: scope.tenantId,
        branchId: scope.branchId,
        productId
      },
      _sum: { quantity: true }
    });

    return Number(result._sum.quantity ?? 0);
  }

  private async ensureDemoScope(): Promise<void> {
    this.demoScopeReady ??= this.seedDemoScope().catch((error: unknown) => {
      this.demoScopeReady = null;
      throw error;
    });

    await this.demoScopeReady;
  }

  private async seedDemoScope(): Promise<void> {
    await this.prisma.tenant.upsert({
      where: { id: DEMO_TENANT_ID },
      update: {},
      create: {
        id: DEMO_TENANT_ID,
        name: "Adega Demo"
      }
    });
    await this.prisma.branch.upsert({
      where: { id: DEMO_BRANCH_ID },
      update: {},
      create: {
        id: DEMO_BRANCH_ID,
        tenantId: DEMO_TENANT_ID,
        name: "Matriz"
      }
    });
    await this.prisma.user.upsert({
      where: { id: DEMO_USER_ID },
      update: {},
      create: {
        id: DEMO_USER_ID,
        tenantId: DEMO_TENANT_ID,
        branchId: DEMO_BRANCH_ID,
        email: "demo@adegaos.local",
        passwordHash: "demo-user-without-login-yet",
        displayName: "Operador Demo"
      }
    });

    const categories = ["Cervejas", "Destilados", "Refrigerantes", "Energéticos", "Conveniência"];
    for (const [index, name] of categories.entries()) {
      await this.prisma.category.upsert({
        where: {
          tenantId_name: {
            tenantId: DEMO_TENANT_ID,
            name
          }
        },
        update: {},
        create: {
          tenantId: DEMO_TENANT_ID,
          name,
          displayOrder: index,
          active: true
        }
      });
    }

    for (const name of ["Bar", "Cozinha", "Espeto"]) {
      await this.prisma.preparationStation.upsert({
        where: {
          tenantId_branchId_name: {
            tenantId: DEMO_TENANT_ID,
            branchId: DEMO_BRANCH_ID,
            name
          }
        },
        update: {},
        create: {
          tenantId: DEMO_TENANT_ID,
          branchId: DEMO_BRANCH_ID,
          name,
          active: true
        }
      });
    }

    for (let index = 1; index <= 8; index += 1) {
      await this.prisma.serviceTable.upsert({
        where: {
          tenantId_branchId_name: {
            tenantId: DEMO_TENANT_ID,
            branchId: DEMO_BRANCH_ID,
            name: `Mesa ${index}`
          }
        },
        update: {},
        create: {
          tenantId: DEMO_TENANT_ID,
          branchId: DEMO_BRANCH_ID,
          name: `Mesa ${index}`,
          status: ServiceTableStatus.AVAILABLE,
          active: true
        }
      });
    }

    for (const seed of demoProductSeeds) {
      const product = await this.prisma.product.upsert({
        where: {
          tenantId_branchId_sku: {
            tenantId: DEMO_TENANT_ID,
            branchId: DEMO_BRANCH_ID,
            sku: seed.sku
          }
        },
        update: {
          name: seed.name,
          barcode: seed.barcode,
          category: seed.category,
          unit: seed.unit,
          priceCents: seed.salePriceCents,
          averageCostCents: seed.costPriceCents,
          minStock: seed.minStock.toString(),
          active: seed.active,
          ageRestricted: seed.ageRestricted
        },
        create: {
          tenantId: DEMO_TENANT_ID,
          branchId: DEMO_BRANCH_ID,
          name: seed.name,
          sku: seed.sku,
          barcode: seed.barcode,
          category: seed.category,
          unit: seed.unit,
          priceCents: seed.salePriceCents,
          averageCostCents: seed.costPriceCents,
          minStock: seed.minStock.toString(),
          active: seed.active,
          ageRestricted: seed.ageRestricted
        }
      });

      const imageKey = imageKeyForSku(seed.sku);
      const image = imageKey ? findProductImage(imageKey) : null;
      if (image && image.status === "verified") {
        await this.prisma.productImage.upsert({
          where: { storageKey: image.file },
          update: {
            tenantId: DEMO_TENANT_ID,
            productId: product.id,
            sourceUrl: image.source_url,
            sourceDomain: image.source_domain,
            sourceType: image.source_type,
            usageNote: image.license_or_usage_note,
            mimeType: image.mime_type,
            width: image.width,
            height: image.height,
            fileSizeBytes: BigInt(image.file_size_bytes),
            sha256: image.sha256,
            altText: image.alt,
            isPrimary: true,
            status: image.status,
            createdBy: DEMO_USER_ID,
            archivedAt: null
          },
          create: {
            tenantId: DEMO_TENANT_ID,
            productId: product.id,
            storageKey: image.file,
            sourceUrl: image.source_url,
            sourceDomain: image.source_domain,
            sourceType: image.source_type,
            usageNote: image.license_or_usage_note,
            mimeType: image.mime_type,
            width: image.width,
            height: image.height,
            fileSizeBytes: BigInt(image.file_size_bytes),
            sha256: image.sha256,
            altText: image.alt,
            isPrimary: true,
            status: image.status,
            createdBy: DEMO_USER_ID
          }
        });
      }

      const hasOpeningStock = await this.prisma.stockMovement.findFirst({
        where: {
          tenantId: DEMO_TENANT_ID,
          branchId: DEMO_BRANCH_ID,
          productId: product.id,
          type: StockMovementType.INITIAL_BALANCE,
          reason: "Carga demo"
        },
        select: { id: true }
      });

      if (!hasOpeningStock) {
        await this.prisma.stockMovement.create({
          data: {
            tenantId: DEMO_TENANT_ID,
            branchId: DEMO_BRANCH_ID,
            productId: product.id,
            type: StockMovementType.INITIAL_BALANCE,
            quantity: seed.openingStock.toString(),
            unitCostCents: seed.costPriceCents,
            reason: "Carga demo"
          }
        });
      }
    }
  }

  private async audit(
    scope: RequestScope,
    action: string,
    payload: Prisma.InputJsonValue
  ): Promise<void> {
    await this.prisma.auditLog.create({
      data: {
        tenantId: scope.tenantId,
        branchId: scope.branchId,
        actorUserId: scope.userId,
        action,
        correlationId: scope.correlationId,
        payload
      }
    });
  }

  private async mustCategory(
    scope: RequestScope,
    categoryId: string
  ): Promise<void> {
    const category = await this.prisma.category.findFirst({
      where: { id: categoryId, tenantId: scope.tenantId }
    });

    if (!category) {
      throw new NotFoundException("Category not found.");
    }
  }

  private async mustPreparationStation(
    scope: RequestScope,
    stationId: string
  ): Promise<void> {
    const station = await this.prisma.preparationStation.findFirst({
      where: {
        id: stationId,
        tenantId: scope.tenantId,
        branchId: scope.branchId
      }
    });

    if (!station) {
      throw new NotFoundException("Preparation station not found.");
    }
  }

  private async mustTable(
    tx: Tx,
    scope: RequestScope,
    tableId: string
  ) {
    const table = await tx.serviceTable.findFirst({
      where: {
        id: tableId,
        tenantId: scope.tenantId,
        branchId: scope.branchId,
        active: true
      }
    });

    if (!table) {
      throw new NotFoundException("Table not found.");
    }

    return table;
  }

  private async mustTab(
    tx: Tx,
    scope: RequestScope,
    tabId: string
  ) {
    const tab = await tx.customerTab.findFirst({
      where: {
        id: tabId,
        tenantId: scope.tenantId,
        branchId: scope.branchId,
        status: { in: [CustomerTabStatus.OPEN, CustomerTabStatus.REQUESTED_CLOSE] }
      }
    });

    if (!tab) {
      throw new NotFoundException("Tab not found.");
    }

    return tab;
  }

  private async mustOpenOrder(
    tx: Tx,
    scope: RequestScope,
    orderId: string
  ) {
    const order = await tx.order.findFirst({
      where: {
        id: orderId,
        tenantId: scope.tenantId,
        branchId: scope.branchId,
        status: { in: [OrderStatus.DRAFT, OrderStatus.CONFIRMED] }
      }
    });

    if (!order) {
      throw new NotFoundException("Open order not found.");
    }

    return order;
  }

  private async recalculateOrderTotals(
    tx: Tx,
    scope: RequestScope,
    orderId: string
  ): Promise<void> {
    const items = await tx.orderItem.findMany({
      where: {
        tenantId: scope.tenantId,
        branchId: scope.branchId,
        orderId
      },
      select: {
        totalCents: true,
        totalCostCents: true
      }
    });
    const subtotalCents = items.reduce((sum, item) => sum + item.totalCents, 0n);
    const costOfGoodsCents = items.reduce(
      (sum, item) => sum + item.totalCostCents,
      0n
    );

    await tx.order.update({
      where: { id: orderId },
      data: {
        subtotalCents,
        totalCents: subtotalCents,
        costOfGoodsCents,
        version: { increment: 1 }
      }
    });
  }

  private async readOrder(
    tx: Tx,
    scope: RequestScope,
    orderId: string
  ): Promise<OrderView> {
    const order = await tx.order.findFirst({
      where: {
        id: orderId,
        tenantId: scope.tenantId,
        branchId: scope.branchId
      },
      include: orderInclude
    });

    if (!order) {
      throw new NotFoundException("Order not found.");
    }

    return toOrderView(order);
  }

  private async recordManagerSale(
    tx: Tx,
    scope: RequestScope,
    input: {
      readonly orderId: string;
      readonly totalCents: bigint;
      readonly costOfGoodsCents: bigint;
      readonly paymentRecordId: string;
      readonly paymentMethod: string;
    }
  ): Promise<void> {
    const existingSale = await tx.sale.findUnique({
      where: { orderId: input.orderId }
    });
    const sale =
      existingSale ??
      (await tx.sale.create({
        data: {
          tenantId: scope.tenantId,
          branchId: scope.branchId,
          orderId: input.orderId,
          saleNumber: await this.nextSaleNumber(tx, scope),
          status: "COMPLETED",
          grossCents: input.totalCents,
          discountCents: 0n,
          netCents: input.totalCents,
          cmvCents: input.costOfGoodsCents,
          grossProfitCents: input.totalCents - input.costOfGoodsCents
        }
      }));

    const existingReceivable = await tx.accountReceivable.findFirst({
      where: {
        tenantId: scope.tenantId,
        branchId: scope.branchId,
        paymentRecordId: input.paymentRecordId
      }
    });

    if (existingReceivable) {
      return;
    }

    const settledImmediately = input.paymentMethod === "cash" || input.paymentMethod === "pix";
    await tx.accountReceivable.create({
      data: {
        tenantId: scope.tenantId,
        branchId: scope.branchId,
        saleId: sale.id,
        paymentRecordId: input.paymentRecordId,
        description: `Recebimento da venda ${input.orderId}`,
        competenceDate: new Date(),
        dueDate: new Date(),
        grossCents: input.totalCents,
        feeCents: 0n,
        netExpectedCents: input.totalCents,
        openCents: settledImmediately ? 0n : input.totalCents,
        status: settledImmediately ? "SETTLED" : "OPEN",
        settledAt: settledImmediately ? new Date() : null
      }
    });
  }

  private async nextSaleNumber(tx: Tx, scope: RequestScope): Promise<number> {
    const result = await tx.sale.aggregate({
      where: { tenantId: scope.tenantId, branchId: scope.branchId },
      _max: { saleNumber: true }
    });

    return (result._max.saleNumber ?? 0) + 1;
  }
}

const orderInclude = {
  items: {
    include: {
      product: true
    },
    orderBy: {
      createdAt: "asc" as const
    }
  }
} satisfies Prisma.OrderInclude;

const preparationTicketInclude = {
  station: true,
  items: {
    include: {
      orderItem: {
        include: {
          product: true
        }
      }
    },
    orderBy: {
      createdAt: "asc" as const
    }
  }
} satisfies Prisma.PreparationTicketInclude;

type OrderPayload = Prisma.OrderGetPayload<{ include: typeof orderInclude }>;
type PreparationTicketPayload = Prisma.PreparationTicketGetPayload<{
  include: typeof preparationTicketInclude;
}>;

function toCategoryView(category: {
  readonly id: string;
  readonly name: string;
  readonly displayOrder: number;
  readonly active: boolean;
}): CategoryView {
  return {
    id: category.id,
    name: category.name,
    displayOrder: category.displayOrder,
    active: category.active
  };
}

function toPreparationStationView(station: {
  readonly id: string;
  readonly name: string;
  readonly active: boolean;
}): PreparationStationView {
  return {
    id: station.id,
    name: station.name,
    active: station.active
  };
}

function toServiceTableView(table: {
  readonly id: string;
  readonly name: string;
  readonly status: ServiceTableStatus | string;
  readonly active: boolean;
}): ServiceTableView {
  return {
    id: table.id,
    name: table.name,
    status: table.status,
    active: table.active
  };
}

function toCustomerTabView(tab: {
  readonly id: string;
  readonly displayNumber: number;
  readonly customerLabel: string | null;
  readonly status: CustomerTabStatus | string;
}): CustomerTabView {
  return {
    id: tab.id,
    displayNumber: tab.displayNumber,
    customerLabel: tab.customerLabel,
    status: tab.status
  };
}

function toOrderView(order: OrderPayload): OrderView {
  return {
    id: order.id,
    type: order.type,
    status: order.status,
    tableId: order.tableId,
    tabId: order.tabId,
    subtotalCents: order.subtotalCents.toString(),
    discountCents: order.discountCents.toString(),
    totalCents: order.totalCents.toString(),
    costOfGoodsCents: order.costOfGoodsCents.toString(),
    version: order.version,
    openedAt: order.openedAt.toISOString(),
    closedAt: order.closedAt?.toISOString() ?? null,
    completedAt: order.completedAt?.toISOString() ?? null,
    items: order.items.map((item) => ({
      id: item.id,
      productId: item.productId,
      productName: item.product.name,
      quantity: item.quantity.toString(),
      unitPriceCents: item.unitPriceCents.toString(),
      totalCents: item.totalCents.toString(),
      status: item.status,
      stationId: item.preparationStationId,
      note: item.note
    }))
  };
}

function toPreparationTicketView(ticket: PreparationTicketPayload): PreparationTicketView {
  return {
    id: ticket.id,
    stationId: ticket.stationId,
    stationName: ticket.station.name,
    orderId: ticket.orderId,
    status: ticket.status,
    receivedAt: ticket.receivedAt.toISOString(),
    startedAt: ticket.startedAt?.toISOString() ?? null,
    readyAt: ticket.readyAt?.toISOString() ?? null,
    items: ticket.items.map((item) => ({
      id: item.id,
      orderItemId: item.orderItemId,
      productName: item.orderItem.product.name,
      quantity: item.quantity.toString(),
      status: item.status,
      note: item.orderItem.note
    }))
  };
}

function preparationStatusForAction(
  action: "ack" | "start" | "ready" | "issues"
): PreparationTicketStatus {
  if (action === "ack") {
    return PreparationTicketStatus.ACKNOWLEDGED;
  }

  if (action === "start") {
    return PreparationTicketStatus.PREPARING;
  }

  if (action === "ready") {
    return PreparationTicketStatus.READY;
  }

  return PreparationTicketStatus.ISSUE;
}

function demoStations(): PreparationStationView[] {
  return [
    { id: "demo-station-bar", name: "Bar", active: true },
    { id: "demo-station-kitchen", name: "Cozinha", active: true },
    { id: "demo-station-skewer", name: "Espeto", active: true }
  ];
}

function demoTables(): ServiceTableView[] {
  return Array.from({ length: 8 }, (_, index) => ({
    id: `demo-table-${index + 1}`,
    name: `Mesa ${index + 1}`,
    status:
      index === 1 || index === 4
        ? ServiceTableStatus.OCCUPIED
        : ServiceTableStatus.AVAILABLE,
    active: true
  }));
}

function normalizeMovementQuantity(type: StockMovementInput["type"], quantity: number): number {
  if (type === "LOSS") {
    return -Math.abs(quantity);
  }

  if (quantity === 0) {
    throw new BadRequestException("Quantity cannot be zero.");
  }

  return quantity;
}

function stockStatus(balance: number, minStock: number): "normal" | "low" | "zero" {
  if (balance <= 0) {
    return "zero";
  }

  return balance <= minStock ? "low" : "normal";
}

function toProductView(
  product: {
    readonly id: string;
    readonly name: string;
    readonly sku: string;
    readonly barcode: string | null;
    readonly category: string;
    readonly unit: string;
    readonly priceCents: bigint;
    readonly averageCostCents: bigint;
    readonly minStock: Prisma.Decimal;
    readonly preparationStationId: string | null;
    readonly active: boolean;
    readonly ageRestricted: boolean;
    readonly images?: readonly {
      readonly storageKey: string;
      readonly altText: string;
      readonly width: number;
      readonly height: number;
      readonly status: string;
    }[];
  },
  stockOnHand: number
): ProductView {
  const minStock = Number(product.minStock);
  const image = product.images?.[0];

  return {
    id: product.id,
    name: product.name,
    sku: product.sku,
    barcode: product.barcode,
    category: product.category,
    unit: product.unit,
    salePriceCents: product.priceCents.toString(),
    costPriceCents: product.averageCostCents.toString(),
    minStock: minStock.toString(),
    preparationStationId: product.preparationStationId,
    active: product.active,
    ageRestricted: product.ageRestricted,
    stockOnHand: stockOnHand.toString(),
    stockStatus: stockStatus(stockOnHand, minStock),
    primaryImage: image
      ? {
          url: storageKeyToPublicUrl(image.storageKey),
          altText: image.altText,
          width: image.width,
          height: image.height,
          status: image.status
        }
      : null
  };
}

function imageKeyForSku(sku: string): string | null {
  if (Object.prototype.hasOwnProperty.call(productImageKeysBySku, sku)) {
    return productImageKeysBySku[sku as keyof typeof productImageKeysBySku];
  }

  return null;
}

function hashPayload(payload: unknown): string {
  return createHash("sha256").update(JSON.stringify(payload)).digest("hex");
}
