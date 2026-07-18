import { Controller, Get, Req } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import type { Request } from "express";

import { OperationsService } from "./operations.service";
import { scopeFromRequest } from "./scope";

@ApiTags("finance")
@Controller("finance")
export class FinanceController {
  constructor(private readonly operations: OperationsService) {}

  @Get("overview")
  overview(@Req() request: Request) {
    return this.operations.dashboard(scopeFromRequest(request));
  }
}
