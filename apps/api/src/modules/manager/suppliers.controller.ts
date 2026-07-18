import { Body, Controller, Get, Param, Patch, Post, Req } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import type { Request } from "express";

import { scopeFromRequest } from "../operations/scope";
import { ManagementService } from "./management.service";
import { createSupplierSchema, updateSupplierSchema } from "./management.schemas";

@ApiTags("suppliers")
@Controller("suppliers")
export class SuppliersController {
  constructor(private readonly management: ManagementService) {}

  @Get()
  list(@Req() request: Request): Promise<unknown> {
    return this.management.listSuppliers(scopeFromRequest(request));
  }

  @Post()
  create(@Req() request: Request, @Body() body: unknown): Promise<unknown> {
    return this.management.createSupplier(
      scopeFromRequest(request),
      createSupplierSchema.parse(body)
    );
  }

  @Get(":id")
  detail(@Req() request: Request, @Param("id") supplierId: string): Promise<unknown> {
    return this.management.getSupplier(scopeFromRequest(request), supplierId);
  }

  @Patch(":id")
  update(
    @Req() request: Request,
    @Param("id") supplierId: string,
    @Body() body: unknown
  ): Promise<unknown> {
    return this.management.updateSupplier(
      scopeFromRequest(request),
      supplierId,
      updateSupplierSchema.parse(body)
    );
  }
}
