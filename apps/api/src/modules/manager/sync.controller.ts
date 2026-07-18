import { Body, Controller, Get, Param, Post, Req } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import type { Request } from "express";

import { scopeFromRequest } from "../operations/scope";
import { ManagementService } from "./management.service";
import { createSyncCommandSchema } from "./management.schemas";

@ApiTags("sync")
@Controller("sync")
export class SyncController {
  constructor(private readonly management: ManagementService) {}

  @Post("commands")
  create(@Req() request: Request, @Body() body: unknown): Promise<unknown> {
    return this.management.createSyncCommand(
      scopeFromRequest(request),
      createSyncCommandSchema.parse(body)
    );
  }

  @Get("commands/:clientCommandId")
  detail(
    @Req() request: Request,
    @Param("clientCommandId") clientCommandId: string
  ): Promise<unknown> {
    return this.management.getSyncCommand(scopeFromRequest(request), clientCommandId);
  }

  @Post("commands/:clientCommandId/retry")
  retry(
    @Req() request: Request,
    @Param("clientCommandId") clientCommandId: string
  ): Promise<unknown> {
    return this.management.retrySyncCommand(scopeFromRequest(request), clientCommandId);
  }
}
