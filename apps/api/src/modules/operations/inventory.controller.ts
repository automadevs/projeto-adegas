import { Body, Controller, Get, Post, Req } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import type { Request } from "express";

import { OperationsService } from "./operations.service";
import { getIdempotencyKey, scopeFromRequest } from "./scope";
import { stockMovementSchema } from "./schemas";

@ApiTags("inventory")
@Controller("inventory")
export class InventoryController {
  constructor(private readonly operations: OperationsService) {}

  @Get("balances")
  balances(@Req() request: Request) {
    return this.operations.inventoryBalances(scopeFromRequest(request));
  }

  @Get("movements")
  movements(@Req() request: Request) {
    return this.operations.inventoryMovements(scopeFromRequest(request));
  }

  @Post("movements")
  createMovement(@Req() request: Request, @Body() body: unknown) {
    return this.operations.createInventoryMovement(
      scopeFromRequest(request),
      stockMovementSchema.parse(body),
      getIdempotencyKey(request)
    );
  }

  @Post("adjustments")
  createAdjustment(@Req() request: Request, @Body() body: unknown) {
    return this.operations.createInventoryMovement(
      scopeFromRequest(request),
      stockMovementSchema.parse(body),
      getIdempotencyKey(request)
    );
  }
}
