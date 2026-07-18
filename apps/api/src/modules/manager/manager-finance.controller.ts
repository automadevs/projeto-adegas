import { Body, Controller, Get, Param, Post, Req } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import type { Request } from "express";

import { scopeFromRequest } from "../operations/scope";
import { ManagementService } from "./management.service";
import {
  createPayableSchema,
  payPayableSchema,
  settleReceivableSchema
} from "./management.schemas";

@ApiTags("finance")
@Controller("finance")
export class ManagerFinanceController {
  constructor(private readonly management: ManagementService) {}

  @Get("payables")
  payables(@Req() request: Request) {
    return this.management.listPayables(scopeFromRequest(request));
  }

  @Post("payables")
  createPayable(@Req() request: Request, @Body() body: unknown) {
    return this.management.createPayable(
      scopeFromRequest(request),
      createPayableSchema.parse(body)
    );
  }

  @Post("payables/:id/pay")
  payPayable(
    @Req() request: Request,
    @Param("id") payableId: string,
    @Body() body: unknown
  ) {
    return this.management.payPayable(
      scopeFromRequest(request),
      payableId,
      payPayableSchema.parse(body)
    );
  }

  @Get("receivables")
  receivables(@Req() request: Request) {
    return this.management.listReceivables(scopeFromRequest(request));
  }

  @Post("receivables/:id/settle")
  settleReceivable(
    @Req() request: Request,
    @Param("id") receivableId: string,
    @Body() body: unknown
  ) {
    return this.management.settleReceivable(
      scopeFromRequest(request),
      receivableId,
      settleReceivableSchema.parse(body)
    );
  }

  @Get("cash-flow")
  cashFlow(@Req() request: Request) {
    return this.management.cashFlow(scopeFromRequest(request));
  }

  @Get("dre")
  dre(@Req() request: Request) {
    return this.management.dre(scopeFromRequest(request));
  }

  @Post("reconciliation")
  reconciliation(@Req() request: Request) {
    return this.management.reconcile(scopeFromRequest(request));
  }
}
