import { z } from "zod";

const cents = z.coerce.number().int().nonnegative();
const positiveQuantity = z.coerce.number().int().positive();
const optionalUuid = z.string().uuid().optional();

export const createItemSchema = z.object({
  name: z.string().trim().min(2),
  sku: z.string().trim().min(1),
  barcode: z.string().trim().optional(),
  category: z.string().trim().min(1).default("Geral"),
  unit: z.string().trim().min(1).default("un"),
  salePriceCents: cents,
  costPriceCents: cents,
  minStock: z.coerce.number().nonnegative().default(0),
  preparationStationId: optionalUuid,
  ageRestricted: z.coerce.boolean().default(false),
  active: z.coerce.boolean().default(true)
});

export const updateProductSchema = createItemSchema.partial().refine(
  (value) => Object.keys(value).length > 0,
  "At least one field is required."
);

export const updateProductAvailabilitySchema = z.object({
  active: z.coerce.boolean()
});

export const createCategorySchema = z.object({
  name: z.string().trim().min(2),
  displayOrder: z.coerce.number().int().nonnegative().default(0),
  active: z.coerce.boolean().default(true)
});

export const updateCategorySchema = createCategorySchema.partial().refine(
  (value) => Object.keys(value).length > 0,
  "At least one field is required."
);

export const createPreparationStationSchema = z.object({
  name: z.string().trim().min(2),
  active: z.coerce.boolean().default(true)
});

export const updatePreparationStationSchema = createPreparationStationSchema.partial().refine(
  (value) => Object.keys(value).length > 0,
  "At least one field is required."
);

export const createTableSchema = z.object({
  name: z.string().trim().min(1),
  active: z.coerce.boolean().default(true)
});

export const createTabSchema = z.object({
  displayNumber: z.coerce.number().int().positive(),
  customerLabel: z.string().trim().min(1).optional()
});

export const createOrderSchema = z.object({
  type: z.enum(["COUNTER", "TABLE", "TAB", "DELIVERY"]).default("COUNTER"),
  tableId: optionalUuid,
  tabId: optionalUuid
});

export const addOrderItemSchema = z.object({
  productId: z.string().uuid(),
  quantity: positiveQuantity,
  note: z.string().trim().max(280).optional()
});

export const updateOrderItemSchema = z.object({
  quantity: positiveQuantity.optional(),
  note: z.string().trim().max(280).nullable().optional()
}).refine(
  (value) => Object.keys(value).length > 0,
  "At least one field is required."
);

export const stockMovementSchema = z.object({
  itemId: z.string().uuid(),
  type: z.enum(["INITIAL_BALANCE", "ADJUSTMENT", "LOSS"]),
  quantity: z.coerce.number(),
  unitCostCents: cents.optional(),
  reason: z.string().trim().min(3)
});

export const finalizeSaleSchema = z.object({
  items: z.array(
    z.object({
      itemId: z.string().uuid(),
      quantity: positiveQuantity
    })
  ).min(1),
  payment: z.object({
    method: z.enum(["cash", "pix", "card"]),
    amountCents: cents
  })
});

export const completeOrderSchema = z.object({
  payment: z.object({
    method: z.enum(["cash", "pix", "card"]),
    amountCents: cents
  })
});

export type CreateItemInput = z.infer<typeof createItemSchema>;
export type AddOrderItemInput = z.infer<typeof addOrderItemSchema>;
export type CompleteOrderInput = z.infer<typeof completeOrderSchema>;
export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type CreateOrderInput = z.infer<typeof createOrderSchema>;
export type CreatePreparationStationInput = z.infer<typeof createPreparationStationSchema>;
export type CreateTabInput = z.infer<typeof createTabSchema>;
export type CreateTableInput = z.infer<typeof createTableSchema>;
export type FinalizeSaleInput = z.infer<typeof finalizeSaleSchema>;
export type StockMovementInput = z.infer<typeof stockMovementSchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;
export type UpdateOrderItemInput = z.infer<typeof updateOrderItemSchema>;
export type UpdatePreparationStationInput = z.infer<typeof updatePreparationStationSchema>;
export type UpdateProductAvailabilityInput = z.infer<typeof updateProductAvailabilitySchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
