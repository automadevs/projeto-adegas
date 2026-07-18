import { PrismaPg } from "@prisma/adapter-pg";

import { PrismaClient } from "./generated/prisma/client";

export const databasePackage = {
  name: "@adegaos/database",
  prismaSchemaPath: "packages/database/prisma/schema.prisma",
  generatedClientPath: "packages/database/src/generated/prisma"
} as const;

export type DatabaseProvider = "postgresql";

export const databaseProvider: DatabaseProvider = "postgresql";

export function createPrismaClient(
  connectionString =
    process.env.DATABASE_URL ??
    "postgresql://adegaos:adegaos@localhost:5432/adegaos?schema=public"
): PrismaClient {
  return new PrismaClient({
    adapter: new PrismaPg({ connectionString })
  });
}

export {
  FinancialEntryType,
  CustomerTabStatus,
  OrderItemStatus,
  OrderStatus,
  OrderType,
  PaymentStatus,
  PreparationTicketStatus,
  Prisma,
  PrismaClient,
  ServiceTableStatus,
  StockMovementType
} from "./generated/prisma/client";
