import { Controller, Get, Req } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import type { Request } from "express";

import { OperationsService } from "./operations.service";
import { scopeFromRequest } from "./scope";

@ApiTags("audit")
@Controller("audit")
export class AuditController {
  constructor(private readonly operations: OperationsService) {}

  @Get("events")
  events(@Req() request: Request) {
    return this.operations.auditEvents(scopeFromRequest(request));
  }
}
