import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { randomUUID } from "node:crypto";

import { Prisma, PrismaClient, StockMovementType } from "@adegaos/database";

import { PrismaService } from "../../shared/database/prisma.service";
import {
  DEMO_BRANCH_ID,
  DEMO_TENANT_ID,
  DEMO_USER_ID,
  RequestScope
} from "../operations/scope";
import type {
  CreatePayableInput,
  CreatePurchaseInput,
  CreateReportExportInput,
  CreateSupplierInput,
  CreateSyncCommandInput,
  PayPayableInput,
  SettleReceivableInput,
  UpdateSupplierInput
} from "./management.schemas";

type Tx = Parameters<Parameters<PrismaClient["$transaction"]>[0]>[0];
type PurchaseDetail = Prisma.PurchaseOrderGetPayload<{
  include: {
    supplier: true;
    items: { include: { product: true } };
    payables: true;
  };
}>;
type ReportExportRecord = Prisma.ReportExportGetPayload<Record<string, never>>;
type ApiJsonValue =
  | string
  | number
  | boolean
  | null
  | ApiJsonValue[]
  | { readonly [key: string]: ApiJsonValue };

interface DemoSyncCommandRecord {
  readonly id: string;
  readonly tenantId: string;
  readonly branchId: string;
  readonly clientCommandId: string;
  readonly deviceId: string;
  readonly userId: string;
  readonly commandType: string;
  readonly payloadJson: Prisma.InputJsonValue;
  readonly status: string;
  readonly serverResultJson: Prisma.InputJsonValue;
  readonly createdAt: Date;
  readonly processedAt: Date | null;
}

@Injectable()
export class ManagementService {
  private readonly demoSyncCommands = new Map<string, DemoSyncCommandRecord>();

  constructor(private readonly prismaService: PrismaService) {}

  async listSuppliers(scope: RequestScope) {
    if (!this.prismaService.isAvailable()) {
      return [];
    }

    const suppliers = await this.prisma.supplier.findMany({
      where: { tenantId: scope.tenantId },
      orderBy: { name: "asc" }
    });

    return toApiJson(suppliers);
  }

  async createSupplier(scope: RequestScope, input: CreateSupplierInput) {
    if (!this.prismaService.isAvailable()) {
      throw new BadRequestException("Suppliers require the database-backed API.");
    }

    const supplier = await this.prisma.supplier.create({
      data: {
        tenantId: scope.tenantId,
        name: input.name,
        contactName: input.contactName,
        phone: input.phone,
        whatsapp: input.whatsapp,
        email: input.email,
        leadTimeDays: input.leadTimeDays,
        active: input.active
      }
    });
    await this.audit(scope, "supplier.created", { supplierId: supplier.id });

    return toApiJson(supplier);
  }

  async getSupplier(scope: RequestScope, supplierId: string): Promise<ApiJsonValue> {
    if (!this.prismaService.isAvailable()) {
      throw new NotFoundException("Supplier not found.");
    }

    const supplier = await this.prisma.supplier.findFirst({
      where: { id: supplierId, tenantId: scope.tenantId },
      include: {
        products: { include: { product: true } },
        purchaseOrders: true
      }
    });

    if (!supplier) {
      throw new NotFoundException("Supplier not found.");
    }

    return toApiJson(supplier);
  }

  async updateSupplier(
    scope: RequestScope,
    supplierId: string,
    input: UpdateSupplierInput
  ) {
    if (!this.prismaService.isAvailable()) {
      throw new NotFoundException("Supplier not found.");
    }

    await this.ensureSupplier(scope, supplierId);
    const supplier = await this.prisma.supplier.update({
      where: { id: supplierId },
      data: input
    });
    await this.audit(scope, "supplier.updated", {
      supplierId,
      changes: input
    });

    return toApiJson(supplier);
  }

  async listPurchases(scope: RequestScope): Promise<ApiJsonValue> {
    if (!this.prismaService.isAvailable()) {
      return [];
    }

    const purchases = await this.prisma.purchaseOrder.findMany({
      where: { tenantId: scope.tenantId, branchId: scope.branchId },
      include: { supplier: true, items: { include: { product: true } }, payables: true },
      orderBy: { orderedAt: "desc" }
    });

    return toApiJson(purchases);
  }

  async createPurchase(
    scope: RequestScope,
    input: CreatePurchaseInput
  ): Promise<ApiJsonValue> {
    if (!this.prismaService.isAvailable()) {
      throw new BadRequestException("Purchases require the database-backed API.");
    }

    const purchase = await this.prisma.$transaction(async (tx) => {
      if (input.supplierId) {
        await this.ensureSupplier(scope, input.supplierId, tx);
      }

      const products = await tx.product.findMany({
        where: {
          tenantId: scope.tenantId,
          branchId: scope.branchId,
          id: { in: input.items.map((item) => item.productId) }
        }
      });

      if (products.length !== input.items.length) {
        throw new NotFoundException("One or more products were not found.");
      }

      const subtotalCents = input.items.reduce(
        (sum, item) => sum + BigInt(item.unitCostCents) * BigInt(Math.trunc(item.quantity)),
        0n
      );
      const totalCents = subtotalCents + BigInt(input.freightCents) - BigInt(input.discountCents);

      const purchase = await tx.purchaseOrder.create({
        data: {
          tenantId: scope.tenantId,
          branchId: scope.branchId,
          supplierId: input.supplierId,
          status: "OPEN",
          expectedAt: input.expectedAt,
          subtotalCents,
          freightCents: BigInt(input.freightCents),
          discountCents: BigInt(input.discountCents),
          totalCents
        }
      });

      for (const item of input.items) {
        await tx.purchaseOrderItem.create({
          data: {
            tenantId: scope.tenantId,
            purchaseOrderId: purchase.id,
            productId: item.productId,
            quantity: item.quantity.toString(),
            unitCostCents: BigInt(item.unitCostCents)
          }
        });
      }

      await tx.accountPayable.create({
        data: {
          tenantId: scope.tenantId,
          branchId: scope.branchId,
          supplierId: input.supplierId,
          purchaseOrderId: purchase.id,
          description: `Compra ${purchase.id}`,
          competenceDate: new Date(),
          dueDate: input.expectedAt ?? new Date(),
          amountCents: totalCents,
          openCents: totalCents,
          status: "OPEN"
        }
      });

      await this.audit(scope, "purchase.created", {
        purchaseOrderId: purchase.id,
        totalCents: totalCents.toString()
      }, tx);

      return this.getPurchaseRecord(scope, purchase.id, tx);
    });

    return toApiJson(purchase);
  }

  async getPurchase(
    scope: RequestScope,
    purchaseId: string
  ): Promise<ApiJsonValue> {
    if (!this.prismaService.isAvailable()) {
      throw new NotFoundException("Purchase not found.");
    }

    return toApiJson(await this.getPurchaseRecord(scope, purchaseId));
  }

  private async getPurchaseRecord(
    scope: RequestScope,
    purchaseId: string,
    tx: Tx | PrismaClient = this.prisma
  ): Promise<PurchaseDetail> {
    const purchase = await tx.purchaseOrder.findFirst({
      where: {
        id: purchaseId,
        tenantId: scope.tenantId,
        branchId: scope.branchId
      },
      include: { supplier: true, items: { include: { product: true } }, payables: true }
    });

    if (!purchase) {
      throw new NotFoundException("Purchase not found.");
    }

    return purchase;
  }

  async receivePurchase(scope: RequestScope, purchaseId: string): Promise<ApiJsonValue> {
    if (!this.prismaService.isAvailable()) {
      throw new BadRequestException("Purchases require the database-backed API.");
    }

    const received = await this.prisma.$transaction(async (tx) => {
      const purchase = await this.getPurchaseRecord(scope, purchaseId, tx);

      if (purchase.status === "RECEIVED") {
        return purchase;
      }

      const receipt = await tx.inventoryReceipt.create({
        data: {
          tenantId: scope.tenantId,
          branchId: scope.branchId,
          supplierId: purchase.supplierId,
          documentNumber: purchase.id,
          status: "RECEIVED",
          totalCents: purchase.totalCents
        }
      });

      for (const item of purchase.items) {
        await tx.inventoryReceiptItem.create({
          data: {
            tenantId: scope.tenantId,
            receiptId: receipt.id,
            productId: item.productId,
            baseQuantity: item.quantity,
            unitCostCents: item.unitCostCents
          }
        });
        await tx.stockMovement.create({
          data: {
            tenantId: scope.tenantId,
            branchId: scope.branchId,
            productId: item.productId,
            type: StockMovementType.ADJUSTMENT,
            quantity: item.quantity,
            unitCostCents: item.unitCostCents,
            reason: `Recebimento da compra ${purchase.id}`
          }
        });
        await tx.product.update({
          where: { id: item.productId },
          data: { averageCostCents: item.unitCostCents }
        });
      }

      await tx.purchaseOrder.update({
        where: { id: purchase.id },
        data: { status: "RECEIVED" }
      });
      await this.audit(scope, "purchase.received", {
        purchaseOrderId: purchase.id,
        receiptId: receipt.id
      }, tx);

      return this.getPurchaseRecord(scope, purchase.id, tx);
    });

    return toApiJson(received);
  }

  async cancelPurchase(scope: RequestScope, purchaseId: string) {
    if (!this.prismaService.isAvailable()) {
      throw new BadRequestException("Purchases require the database-backed API.");
    }

    await this.getPurchaseRecord(scope, purchaseId);
    const purchase = await this.prisma.purchaseOrder.update({
      where: { id: purchaseId },
      data: { status: "CANCELLED" }
    });
    await this.audit(scope, "purchase.cancelled", { purchaseOrderId: purchaseId });

    return toApiJson(purchase);
  }

  async listPayables(scope: RequestScope) {
    if (!this.prismaService.isAvailable()) {
      return [];
    }

    const payables = await this.prisma.accountPayable.findMany({
      where: { tenantId: scope.tenantId, branchId: scope.branchId },
      include: { supplier: true },
      orderBy: { dueDate: "asc" }
    });

    return toApiJson(payables);
  }

  async createPayable(scope: RequestScope, input: CreatePayableInput) {
    if (!this.prismaService.isAvailable()) {
      throw new BadRequestException("Finance requires the database-backed API.");
    }

    const payable = await this.prisma.accountPayable.create({
      data: {
        tenantId: scope.tenantId,
        branchId: scope.branchId,
        supplierId: input.supplierId,
        purchaseOrderId: input.purchaseOrderId,
        categoryId: input.categoryId,
        costCenterId: input.costCenterId,
        description: input.description,
        competenceDate: input.competenceDate,
        dueDate: input.dueDate,
        amountCents: BigInt(input.amountCents),
        openCents: BigInt(input.amountCents),
        status: "OPEN"
      }
    });
    await this.audit(scope, "account_payable.created", {
      payableId: payable.id,
      amountCents: payable.amountCents.toString()
    });

    return toApiJson(payable);
  }

  async payPayable(scope: RequestScope, payableId: string, input: PayPayableInput) {
    if (!this.prismaService.isAvailable()) {
      throw new BadRequestException("Finance requires the database-backed API.");
    }

    const payable = await this.prisma.accountPayable.findFirst({
      where: { id: payableId, tenantId: scope.tenantId, branchId: scope.branchId }
    });

    if (!payable) {
      throw new NotFoundException("Payable not found.");
    }

    const amount = BigInt(input.amountCents ?? Number(payable.openCents));
    if (amount <= 0n || amount > payable.openCents) {
      throw new BadRequestException("Invalid payment amount.");
    }

    const openCents = payable.openCents - amount;
    const updated = await this.prisma.accountPayable.update({
      where: { id: payable.id },
      data: {
        openCents,
        status: openCents === 0n ? "PAID" : "PARTIAL",
        paidAt: openCents === 0n ? new Date() : payable.paidAt
      }
    });
    await this.audit(scope, "account_payable.paid", {
      payableId,
      amountCents: amount.toString()
    });

    return toApiJson(updated);
  }

  async listReceivables(scope: RequestScope) {
    if (!this.prismaService.isAvailable()) {
      return [];
    }

    const receivables = await this.prisma.accountReceivable.findMany({
      where: { tenantId: scope.tenantId, branchId: scope.branchId },
      include: { paymentRecord: true, sale: true },
      orderBy: { dueDate: "asc" }
    });

    return toApiJson(receivables);
  }

  async settleReceivable(
    scope: RequestScope,
    receivableId: string,
    input: SettleReceivableInput
  ) {
    if (!this.prismaService.isAvailable()) {
      throw new BadRequestException("Finance requires the database-backed API.");
    }

    const receivable = await this.prisma.accountReceivable.findFirst({
      where: { id: receivableId, tenantId: scope.tenantId, branchId: scope.branchId }
    });

    if (!receivable) {
      throw new NotFoundException("Receivable not found.");
    }

    const amount = BigInt(input.amountCents ?? Number(receivable.openCents));
    if (amount <= 0n || amount > receivable.openCents) {
      throw new BadRequestException("Invalid settlement amount.");
    }

    const openCents = receivable.openCents - amount;
    const updated = await this.prisma.accountReceivable.update({
      where: { id: receivable.id },
      data: {
        feeCents: BigInt(input.feeCents ?? Number(receivable.feeCents)),
        openCents,
        status: openCents === 0n ? "SETTLED" : "PARTIAL",
        settledAt: openCents === 0n ? new Date() : receivable.settledAt
      }
    });
    await this.audit(scope, "account_receivable.settled", {
      receivableId,
      amountCents: amount.toString()
    });

    return toApiJson(updated);
  }

  async cashFlow(scope: RequestScope) {
    if (!this.prismaService.isAvailable()) {
      return { inflowCents: "0", outflowCents: "0", netCents: "0", openPayablesCents: "0", openReceivablesCents: "0" };
    }

    const [entries, payables, receivables] = await Promise.all([
      this.prisma.financialEntry.findMany({
        where: { tenantId: scope.tenantId, branchId: scope.branchId }
      }),
      this.prisma.accountPayable.findMany({
        where: { tenantId: scope.tenantId, branchId: scope.branchId, status: { not: "PAID" } }
      }),
      this.prisma.accountReceivable.findMany({
        where: { tenantId: scope.tenantId, branchId: scope.branchId, status: { not: "SETTLED" } }
      })
    ]);
    const inflow = entries
      .filter((entry) => entry.amountCents > 0n)
      .reduce((sum, entry) => sum + entry.amountCents, 0n);
    const outflow = entries
      .filter((entry) => entry.amountCents < 0n)
      .reduce((sum, entry) => sum + (-entry.amountCents), 0n);
    const openPayables = payables.reduce((sum, payable) => sum + payable.openCents, 0n);
    const openReceivables = receivables.reduce((sum, receivable) => sum + receivable.openCents, 0n);

    return {
      inflowCents: inflow.toString(),
      outflowCents: outflow.toString(),
      netCents: (inflow - outflow).toString(),
      openPayablesCents: openPayables.toString(),
      openReceivablesCents: openReceivables.toString()
    };
  }

  async dre(scope: RequestScope) {
    if (!this.prismaService.isAvailable()) {
      return { revenueCents: "0", cogsCents: "0", grossProfitCents: "0", expensesCents: "0", netProfitCents: "0" };
    }

    const [orders, paid] = await Promise.all([
      this.prisma.order.findMany({
        where: { tenantId: scope.tenantId, branchId: scope.branchId, status: "COMPLETED" }
      }),
      this.prisma.accountPayable.findMany({
        where: { tenantId: scope.tenantId, branchId: scope.branchId, status: "PAID" }
      })
    ]);
    const revenue = orders.reduce((sum, order) => sum + order.totalCents, 0n);
    const cogs = orders.reduce((sum, order) => sum + order.costOfGoodsCents, 0n);
    const expenses = paid.reduce((sum, payable) => sum + payable.amountCents, 0n);

    return {
      revenueCents: revenue.toString(),
      cogsCents: cogs.toString(),
      grossProfitCents: (revenue - cogs).toString(),
      expensesCents: expenses.toString(),
      netProfitCents: (revenue - cogs - expenses).toString()
    };
  }

  async reconcile(scope: RequestScope) {
    if (!this.prismaService.isAvailable()) {
      return { reconciled: 0, pending: 0 };
    }

    const pending = await this.prisma.accountReceivable.count({
      where: { tenantId: scope.tenantId, branchId: scope.branchId, status: { not: "SETTLED" } }
    });

    await this.audit(scope, "finance.reconciliation.requested", { pending });

    return { reconciled: 0, pending };
  }

  async createReportExport(
    scope: RequestScope,
    input: CreateReportExportInput
  ): Promise<ApiJsonValue> {
    if (!this.prismaService.isAvailable()) {
      throw new BadRequestException("Reports require the database-backed API.");
    }

    await this.ensureDemoScope(scope);
    const report = await this.prisma.reportExport.create({
      data: {
        tenantId: scope.tenantId,
        branchId: scope.branchId,
        type: input.type,
        format: input.format,
        filtersJson: input.filters as Prisma.InputJsonValue,
        status: "READY",
        storageKey: `reports/${scope.tenantId}/${scope.branchId}/${Date.now()}-${input.type}.${input.format}`,
        expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
        createdBy: scope.userId
      }
    });
    await this.audit(scope, "report_export.created", { reportExportId: report.id });

    return toApiJson(report);
  }

  async listReportExports(scope: RequestScope): Promise<ApiJsonValue> {
    if (!this.prismaService.isAvailable()) {
      return [];
    }

    await this.ensureDemoScope(scope);
    const reports = await this.prisma.reportExport.findMany({
      where: { tenantId: scope.tenantId, branchId: scope.branchId },
      orderBy: { createdAt: "desc" },
      take: 50
    });

    return toApiJson(reports);
  }

  async getReportExport(
    scope: RequestScope,
    reportId: string
  ): Promise<ApiJsonValue> {
    if (!this.prismaService.isAvailable()) {
      throw new NotFoundException("Report export not found.");
    }

    return toApiJson(await this.getReportExportRecord(scope, reportId));
  }

  private async getReportExportRecord(
    scope: RequestScope,
    reportId: string
  ): Promise<ReportExportRecord> {
    const report = await this.prisma.reportExport.findFirst({
      where: { id: reportId, tenantId: scope.tenantId, branchId: scope.branchId }
    });

    if (!report) {
      throw new NotFoundException("Report export not found.");
    }

    return report;
  }

  async downloadReportExport(scope: RequestScope, reportId: string) {
    if (!this.prismaService.isAvailable()) {
      throw new NotFoundException("Report export not found.");
    }

    const report = await this.getReportExportRecord(scope, reportId);
    return {
      reportId: report.id,
      format: report.format,
      storageKey: report.storageKey,
      expiresAt: report.expiresAt?.toISOString() ?? null
    };
  }

  async createSyncCommand(
    scope: RequestScope,
    input: CreateSyncCommandInput
  ): Promise<unknown> {
    if (!this.prismaService.isAvailable()) {
      return toApiJson(this.upsertDemoSyncCommand(scope, input));
    }

    await this.ensureDemoScope(scope);
    const command = await this.prisma.syncCommand.upsert({
      where: {
        tenantId_branchId_clientCommandId: {
          tenantId: scope.tenantId,
          branchId: scope.branchId,
          clientCommandId: input.clientCommandId
        }
      },
      update: {},
      create: {
        tenantId: scope.tenantId,
        branchId: scope.branchId,
        clientCommandId: input.clientCommandId,
        deviceId: input.deviceId,
        userId: scope.userId,
        commandType: input.commandType,
        payloadJson: input.payload as Prisma.InputJsonValue,
        status: "RECEIVED",
        serverResultJson: { accepted: true }
      }
    });

    return toApiJson(command);
  }

  async getSyncCommand(scope: RequestScope, clientCommandId: string): Promise<unknown> {
    if (!this.prismaService.isAvailable()) {
      return toApiJson(this.getDemoSyncCommand(scope, clientCommandId));
    }

    const command = await this.prisma.syncCommand.findFirst({
      where: {
        tenantId: scope.tenantId,
        branchId: scope.branchId,
        clientCommandId
      }
    });

    if (!command) {
      throw new NotFoundException("Sync command not found.");
    }

    return toApiJson(command);
  }

  async retrySyncCommand(scope: RequestScope, clientCommandId: string): Promise<unknown> {
    if (!this.prismaService.isAvailable()) {
      const command = this.getDemoSyncCommand(scope, clientCommandId);
      const retried = {
        ...command,
        status: "RETRY_REQUESTED",
        processedAt: null
      };
      this.demoSyncCommands.set(demoSyncCommandKey(scope, clientCommandId), retried);

      return toApiJson(retried);
    }

    const command = await this.prisma.syncCommand.findFirst({
      where: {
        tenantId: scope.tenantId,
        branchId: scope.branchId,
        clientCommandId
      }
    });

    if (!command) {
      throw new NotFoundException("Sync command not found.");
    }

    const retried = await this.prisma.syncCommand.update({
      where: { id: command.id },
      data: {
        status: "RETRY_REQUESTED",
        processedAt: null
      }
    });

    return toApiJson(retried);
  }

  private get prisma(): PrismaClient {
    return this.prismaService.client;
  }

  private async ensureSupplier(
    scope: RequestScope,
    supplierId: string,
    tx: Tx | PrismaClient = this.prisma
  ): Promise<void> {
    const supplier = await tx.supplier.findFirst({
      where: { id: supplierId, tenantId: scope.tenantId }
    });

    if (!supplier) {
      throw new NotFoundException("Supplier not found.");
    }
  }

  private upsertDemoSyncCommand(
    scope: RequestScope,
    input: CreateSyncCommandInput
  ): DemoSyncCommandRecord {
    const key = demoSyncCommandKey(scope, input.clientCommandId);
    const existing = this.demoSyncCommands.get(key);

    if (existing) {
      return existing;
    }

    const command: DemoSyncCommandRecord = {
      id: `demo-sync-${randomUUID()}`,
      tenantId: scope.tenantId,
      branchId: scope.branchId,
      clientCommandId: input.clientCommandId,
      deviceId: input.deviceId,
      userId: scope.userId,
      commandType: input.commandType,
      payloadJson: input.payload as Prisma.InputJsonValue,
      status: "RECEIVED",
      serverResultJson: { accepted: true, demoMode: true },
      createdAt: new Date(),
      processedAt: null
    };
    this.demoSyncCommands.set(key, command);

    return command;
  }

  private getDemoSyncCommand(
    scope: RequestScope,
    clientCommandId: string
  ): DemoSyncCommandRecord {
    const command = this.demoSyncCommands.get(
      demoSyncCommandKey(scope, clientCommandId)
    );

    if (!command) {
      throw new NotFoundException("Sync command not found.");
    }

    return command;
  }

  private async ensureDemoScope(
    scope: RequestScope,
    tx: Tx | PrismaClient = this.prisma
  ): Promise<void> {
    if (scope.tenantId !== DEMO_TENANT_ID || scope.branchId !== DEMO_BRANCH_ID) {
      return;
    }

    await tx.tenant.upsert({
      where: { id: DEMO_TENANT_ID },
      update: {},
      create: {
        id: DEMO_TENANT_ID,
        name: "Adega Demo"
      }
    });
    await tx.branch.upsert({
      where: { id: DEMO_BRANCH_ID },
      update: {},
      create: {
        id: DEMO_BRANCH_ID,
        tenantId: DEMO_TENANT_ID,
        name: "Matriz"
      }
    });
    await tx.user.upsert({
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
  }

  private async audit(
    scope: RequestScope,
    action: string,
    payload: Prisma.InputJsonValue,
    tx: Tx | PrismaClient = this.prisma
  ): Promise<void> {
    await this.ensureDemoScope(scope, tx);
    await tx.auditLog.create({
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
}

function demoSyncCommandKey(scope: RequestScope, clientCommandId: string): string {
  return `${scope.tenantId}:${scope.branchId}:${clientCommandId}`;
}

function toApiJson(value: unknown): ApiJsonValue {
  if (value === null || value === undefined) {
    return null;
  }

  if (typeof value === "bigint") {
    return value.toString();
  }

  if (
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean"
  ) {
    return value;
  }

  if (value instanceof Date) {
    return value.toISOString();
  }

  if (Array.isArray(value)) {
    return value.map((item) => toApiJson(item));
  }

  if (isRecord(value)) {
    const maybeToJson = value.toJSON;
    if (typeof maybeToJson === "function") {
      const serialized = maybeToJson.call(value);
      if (serialized !== value) {
        return toApiJson(serialized);
      }
    }

    return Object.fromEntries(
      Object.entries(value)
        .filter(([, entryValue]) => entryValue !== undefined)
        .map(([key, entryValue]) => [key, toApiJson(entryValue)])
    );
  }

  return String(value);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}
