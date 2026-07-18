import { Body, Controller, Get, Param, Patch, Post, Query, Req } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import type { Request } from "express";

import { OperationsService } from "./operations.service";
import { scopeFromRequest } from "./scope";
import {
  createItemSchema,
  updateProductAvailabilitySchema,
  updateProductSchema
} from "./schemas";

@ApiTags("products")
@Controller("products")
export class ProductsController {
  constructor(private readonly operations: OperationsService) {}

  @Get("catalog")
  catalog(@Req() request: Request, @Query("search") search?: string) {
    return this.operations.listItems(scopeFromRequest(request), search);
  }

  @Get()
  listProducts(@Req() request: Request, @Query("search") search?: string) {
    return this.operations.listItems(scopeFromRequest(request), search);
  }

  @Post()
  createProduct(@Req() request: Request, @Body() body: unknown) {
    return this.operations.createItem(
      scopeFromRequest(request),
      createItemSchema.parse(body)
    );
  }

  @Get(":id")
  getProduct(@Req() request: Request, @Param("id") productId: string) {
    return this.operations.getProduct(scopeFromRequest(request), productId);
  }

  @Patch(":id")
  updateProduct(
    @Req() request: Request,
    @Param("id") productId: string,
    @Body() body: unknown
  ) {
    return this.operations.updateProduct(
      scopeFromRequest(request),
      productId,
      updateProductSchema.parse(body)
    );
  }

  @Post(":id/archive")
  archiveProduct(@Req() request: Request, @Param("id") productId: string) {
    return this.operations.archiveProduct(scopeFromRequest(request), productId);
  }

  @Post(":id/availability")
  updateAvailability(
    @Req() request: Request,
    @Param("id") productId: string,
    @Body() body: unknown
  ) {
    return this.operations.updateProductAvailability(
      scopeFromRequest(request),
      productId,
      updateProductAvailabilitySchema.parse(body)
    );
  }
}
