import { Body, Controller, Get, Post, Query, Req } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import type { Request } from "express";

import { OperationsService } from "./operations.service";
import { scopeFromRequest } from "./scope";
import { createItemSchema } from "./schemas";

@ApiTags("items")
@Controller()
export class ItemsController {
  constructor(private readonly operations: OperationsService) {}

  @Get("me/capabilities")
  capabilities() {
    return this.operations.capabilities();
  }

  @Get("items")
  listItems(@Req() request: Request, @Query("search") search?: string) {
    return this.operations.listItems(scopeFromRequest(request), search);
  }

  @Post("items")
  createItem(@Req() request: Request, @Body() body: unknown) {
    return this.operations.createItem(
      scopeFromRequest(request),
      createItemSchema.parse(body)
    );
  }
}
