import { Body, Controller, Get, Param, Patch, Post, Req } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import type { Request } from "express";

import { OperationsService } from "./operations.service";
import { getIdempotencyKey, scopeFromRequest } from "./scope";
import {
  addOrderItemSchema,
  completeOrderSchema,
  createOrderSchema,
  createTabSchema,
  createTableSchema,
  updateOrderItemSchema
} from "./schemas";

@ApiTags("order resources")
@Controller("order")
export class OrderResourcesController {
  constructor(private readonly operations: OperationsService) {}

  @Get("tables")
  tables(@Req() request: Request) {
    return this.operations.listTables(scopeFromRequest(request));
  }

  @Post("tables")
  createTable(@Req() request: Request, @Body() body: unknown) {
    return this.operations.createTable(
      scopeFromRequest(request),
      createTableSchema.parse(body)
    );
  }

  @Get("tabs")
  tabs(@Req() request: Request) {
    return this.operations.listTabs(scopeFromRequest(request));
  }

  @Post("tabs")
  createTab(@Req() request: Request, @Body() body: unknown) {
    return this.operations.createTab(
      scopeFromRequest(request),
      createTabSchema.parse(body)
    );
  }
}

@ApiTags("orders")
@Controller("orders")
export class OrdersController {
  constructor(private readonly operations: OperationsService) {}

  @Get()
  list(@Req() request: Request) {
    return this.operations.listOrders(scopeFromRequest(request));
  }

  @Post()
  create(@Req() request: Request, @Body() body: unknown) {
    return this.operations.createOrder(
      scopeFromRequest(request),
      createOrderSchema.parse(body),
      getIdempotencyKey(request)
    );
  }

  @Get(":id")
  detail(@Req() request: Request, @Param("id") orderId: string) {
    return this.operations.getOrder(scopeFromRequest(request), orderId);
  }

  @Post(":id/items")
  addItem(
    @Req() request: Request,
    @Param("id") orderId: string,
    @Body() body: unknown
  ) {
    return this.operations.addOrderItem(
      scopeFromRequest(request),
      orderId,
      addOrderItemSchema.parse(body)
    );
  }

  @Patch(":id/items/:itemId")
  updateItem(
    @Req() request: Request,
    @Param("id") orderId: string,
    @Param("itemId") itemId: string,
    @Body() body: unknown
  ) {
    return this.operations.updateOrderItem(
      scopeFromRequest(request),
      orderId,
      itemId,
      updateOrderItemSchema.parse(body)
    );
  }

  @Post(":id/submit")
  submit(@Req() request: Request, @Param("id") orderId: string) {
    return this.operations.submitOrder(
      scopeFromRequest(request),
      orderId,
      getIdempotencyKey(request)
    );
  }

  @Post(":id/request-close")
  requestClose(@Req() request: Request, @Param("id") orderId: string) {
    return this.operations.requestCloseOrder(scopeFromRequest(request), orderId);
  }

  @Post(":id/complete")
  complete(
    @Req() request: Request,
    @Param("id") orderId: string,
    @Body() body: unknown
  ) {
    return this.operations.completeOrder(
      scopeFromRequest(request),
      orderId,
      completeOrderSchema.parse(body),
      getIdempotencyKey(request)
    );
  }
}
