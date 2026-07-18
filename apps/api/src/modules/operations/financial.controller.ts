import { Controller, Get, Query, Req } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import type { Request } from "express";

import { OperationsService } from "./operations.service";
import { scopeFromRequest } from "./scope";

@ApiTags("financial")
@Controller("financial")
export class FinancialController {
  constructor(private readonly operations: OperationsService) {}

  @Get("dashboard")
  dashboard(@Req() request: Request, @Query("end") end?: string, @Query("start") start?: string) {
    return this.operations.dashboard(scopeFromRequest(request), { end, start });
  }
}
