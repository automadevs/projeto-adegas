import { Body, Controller, Get, Param, Post, Req } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import type { Request } from "express";

import { scopeFromRequest } from "../operations/scope";
import { ManagementService } from "./management.service";
import { createReportExportSchema } from "./management.schemas";

@ApiTags("reports")
@Controller("reports")
export class ReportsController {
  constructor(private readonly management: ManagementService) {}

  @Get("exports")
  list(@Req() request: Request): Promise<unknown> {
    return this.management.listReportExports(scopeFromRequest(request));
  }

  @Post("exports")
  create(@Req() request: Request, @Body() body: unknown): Promise<unknown> {
    return this.management.createReportExport(
      scopeFromRequest(request),
      createReportExportSchema.parse(body)
    );
  }

  @Get("exports/:id")
  detail(@Req() request: Request, @Param("id") reportId: string): Promise<unknown> {
    return this.management.getReportExport(scopeFromRequest(request), reportId);
  }

  @Get("exports/:id/download")
  download(@Req() request: Request, @Param("id") reportId: string): Promise<unknown> {
    return this.management.downloadReportExport(scopeFromRequest(request), reportId);
  }
}
