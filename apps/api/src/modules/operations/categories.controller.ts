import { Body, Controller, Get, Param, Patch, Post, Req } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import type { Request } from "express";

import { OperationsService } from "./operations.service";
import { scopeFromRequest } from "./scope";
import { createCategorySchema, updateCategorySchema } from "./schemas";

@ApiTags("categories")
@Controller("categories")
export class CategoriesController {
  constructor(private readonly operations: OperationsService) {}

  @Get()
  list(@Req() request: Request) {
    return this.operations.listCategories(scopeFromRequest(request));
  }

  @Post()
  create(@Req() request: Request, @Body() body: unknown) {
    return this.operations.createCategory(
      scopeFromRequest(request),
      createCategorySchema.parse(body)
    );
  }

  @Patch(":id")
  update(
    @Req() request: Request,
    @Param("id") categoryId: string,
    @Body() body: unknown
  ) {
    return this.operations.updateCategory(
      scopeFromRequest(request),
      categoryId,
      updateCategorySchema.parse(body)
    );
  }

  @Post(":id/archive")
  archive(@Req() request: Request, @Param("id") categoryId: string) {
    return this.operations.archiveCategory(scopeFromRequest(request), categoryId);
  }
}
