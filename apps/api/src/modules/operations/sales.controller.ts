import { Body, Controller, Get, Param, Post, Req } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import type { Request } from "express";

import { OperationsService } from "./operations.service";
import { getIdempotencyKey, scopeFromRequest } from "./scope";
import { finalizeSaleSchema } from "./schemas";

@ApiTags("sales")
@Controller("sales")
export class SalesController {
  constructor(private readonly operations: OperationsService) {}

  @Get()
  list(@Req() request: Request) {
    return this.operations.listSales(scopeFromRequest(request));
  }

  @Get(":id")
  detail(@Req() request: Request, @Param("id") orderId: string) {
    return this.operations.getSale(scopeFromRequest(request), orderId);
  }

  @Post(":id/cancel")
  cancel(@Req() request: Request, @Param("id") orderId: string) {
    return this.operations.cancelSale(
      scopeFromRequest(request),
      orderId,
      getIdempotencyKey(request)
    );
  }

  @Post("finalize")
  finalize(@Req() request: Request, @Body() body: unknown) {
    return this.operations.finalizeSale(
      scopeFromRequest(request),
      finalizeSaleSchema.parse(body),
      getIdempotencyKey(request)
    );
  }
}
