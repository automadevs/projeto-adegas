import { Module } from "@nestjs/common";

import { HealthController } from "./health.controller";
import { AuthController } from "./modules/auth/auth.controller";
import { AuthService } from "./modules/auth/auth.service";
import { ManagementService } from "./modules/manager/management.service";
import { ManagerFinanceController } from "./modules/manager/manager-finance.controller";
import { PurchasesController } from "./modules/manager/purchases.controller";
import { ReportsController } from "./modules/manager/reports.controller";
import { SuppliersController } from "./modules/manager/suppliers.controller";
import { SyncController } from "./modules/manager/sync.controller";
import { AuditController } from "./modules/operations/audit.controller";
import { BootstrapController } from "./modules/operations/bootstrap.controller";
import { CategoriesController } from "./modules/operations/categories.controller";
import { FinanceController } from "./modules/operations/finance.controller";
import { FinancialController } from "./modules/operations/financial.controller";
import { InventoryController } from "./modules/operations/inventory.controller";
import { ItemsController } from "./modules/operations/items.controller";
import { OperationsService } from "./modules/operations/operations.service";
import { OrderResourcesController, OrdersController } from "./modules/operations/orders.controller";
import { PreparationController } from "./modules/operations/preparation.controller";
import { ProductsController } from "./modules/operations/products.controller";
import { SalesController } from "./modules/operations/sales.controller";
import { PrismaService } from "./shared/database/prisma.service";

@Module({
  controllers: [
    HealthController,
    AuthController,
    BootstrapController,
    ItemsController,
    ProductsController,
    CategoriesController,
    PreparationController,
    OrderResourcesController,
    OrdersController,
    SuppliersController,
    PurchasesController,
    ManagerFinanceController,
    ReportsController,
    SyncController,
    InventoryController,
    SalesController,
    FinancialController,
    FinanceController,
    AuditController
  ],
  providers: [PrismaService, AuthService, OperationsService, ManagementService]
})
export class AppModule {}
