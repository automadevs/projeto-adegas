import { z } from "zod";

const cents = z.coerce.number().int().nonnegative();
const optionalUuid = z.string().uuid().optional();
const dateString = z.coerce.date();

export const createSupplierSchema = z.object({
  name: z.string().trim().min(2),
  contactName: z.string().trim().optional(),
  phone: z.string().trim().optional(),
  whatsapp: z.string().trim().optional(),
  email: z.string().trim().email().optional(),
  leadTimeDays: z.coerce.number().int().nonnegative().default(0),
  active: z.coerce.boolean().default(true)
});

export const updateSupplierSchema = createSupplierSchema.partial().refine(
  (value) => Object.keys(value).length > 0,
  "At least one field is required."
);

export const createPurchaseSchema = z.object({
  supplierId: optionalUuid,
  expectedAt: z.coerce.date().optional(),
  freightCents: cents.default(0),
  discountCents: cents.default(0),
  items: z.array(
    z.object({
      productId: z.string().uuid(),
      quantity: z.coerce.number().int().positive(),
      unitCostCents: cents
    })
  ).min(1)
});

export const createPayableSchema = z.object({
  supplierId: optionalUuid,
  purchaseOrderId: optionalUuid,
  categoryId: optionalUuid,
  costCenterId: optionalUuid,
  description: z.string().trim().min(2),
  competenceDate: dateString,
  dueDate: dateString,
  amountCents: cents
});

export const payPayableSchema = z.object({
  amountCents: cents.optional()
});

export const settleReceivableSchema = z.object({
  amountCents: cents.optional(),
  feeCents: cents.optional()
});

export const createReportExportSchema = z.object({
  type: z.string().trim().min(2),
  format: z.enum(["pdf", "xlsx", "csv"]),
  filters: z.record(z.string(), z.unknown()).default({})
});

export const createSyncCommandSchema = z.object({
  clientCommandId: z.string().trim().min(1),
  deviceId: z.string().trim().min(1),
  commandType: z.string().trim().min(2),
  payload: z.record(z.string(), z.unknown()).default({})
});

export type CreatePayableInput = z.infer<typeof createPayableSchema>;
export type CreatePurchaseInput = z.infer<typeof createPurchaseSchema>;
export type CreateReportExportInput = z.infer<typeof createReportExportSchema>;
export type CreateSupplierInput = z.infer<typeof createSupplierSchema>;
export type CreateSyncCommandInput = z.infer<typeof createSyncCommandSchema>;
export type PayPayableInput = z.infer<typeof payPayableSchema>;
export type SettleReceivableInput = z.infer<typeof settleReceivableSchema>;
export type UpdateSupplierInput = z.infer<typeof updateSupplierSchema>;
