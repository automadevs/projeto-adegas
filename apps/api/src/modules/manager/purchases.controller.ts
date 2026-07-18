import { Body, Controller, Get, Param, Post, Req } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import type { Request } from "express";

import { scopeFromRequest } from "../operations/scope";
import { ManagementService } from "./management.service";
import { createPurchaseSchema } from "./management.schemas";

@ApiTags("purchases")
@Controller("purchases")
export class PurchasesController {
  constructor(private readonly management: ManagementService) {}

  @Get()
  list(@Req() request: Request): Promise<unknown> {
    return this.management.listPurchases(scopeFromRequest(request));
  }

  @Post()
  create(@Req() request: Request, @Body() body: unknown): Promise<unknown> {
    return this.management.createPurchase(
      scopeFromRequest(request),
      createPurchaseSchema.parse(body)
    );
  }

  @Get(":id")
  detail(@Req() request: Request, @Param("id") purchaseId: string): Promise<unknown> {
    return this.management.getPurchase(scopeFromRequest(request), purchaseId);
  }

  @Post(":id/receive")
  receive(@Req() request: Request, @Param("id") purchaseId: string): Promise<unknown> {
    return this.management.receivePurchase(scopeFromRequest(request), purchaseId);
  }

  @Post(":id/cancel")
  cancel(@Req() request: Request, @Param("id") purchaseId: string): Promise<unknown> {
    return this.management.cancelPurchase(scopeFromRequest(request), purchaseId);
  }
}
