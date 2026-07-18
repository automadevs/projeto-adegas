import { Body, Controller, Get, Param, Patch, Post, Query, Req } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import type { Request } from "express";

import { OperationsService } from "./operations.service";
import { scopeFromRequest } from "./scope";
import {
  createPreparationStationSchema,
  updatePreparationStationSchema
} from "./schemas";

@ApiTags("preparation")
@Controller("preparation")
export class PreparationController {
  constructor(private readonly operations: OperationsService) {}

  @Get("stations")
  listStations(@Req() request: Request) {
    return this.operations.listPreparationStations(scopeFromRequest(request));
  }

  @Post("stations")
  createStation(@Req() request: Request, @Body() body: unknown) {
    return this.operations.createPreparationStation(
      scopeFromRequest(request),
      createPreparationStationSchema.parse(body)
    );
  }

  @Patch("stations/:id")
  updateStation(
    @Req() request: Request,
    @Param("id") stationId: string,
    @Body() body: unknown
  ) {
    return this.operations.updatePreparationStation(
      scopeFromRequest(request),
      stationId,
      updatePreparationStationSchema.parse(body)
    );
  }

  @Get("tickets")
  listTickets(@Req() request: Request, @Query("stationId") stationId?: string) {
    return this.operations.listPreparationTickets(
      scopeFromRequest(request),
      stationId
    );
  }

  @Post("tickets/:id/ack")
  ack(@Req() request: Request, @Param("id") ticketId: string) {
    return this.operations.advancePreparationTicket(
      scopeFromRequest(request),
      ticketId,
      "ack"
    );
  }

  @Post("tickets/:id/start")
  start(@Req() request: Request, @Param("id") ticketId: string) {
    return this.operations.advancePreparationTicket(
      scopeFromRequest(request),
      ticketId,
      "start"
    );
  }

  @Post("tickets/:id/ready")
  ready(@Req() request: Request, @Param("id") ticketId: string) {
    return this.operations.advancePreparationTicket(
      scopeFromRequest(request),
      ticketId,
      "ready"
    );
  }

  @Post("tickets/:id/issues")
  issues(@Req() request: Request, @Param("id") ticketId: string) {
    return this.operations.advancePreparationTicket(
      scopeFromRequest(request),
      ticketId,
      "issues"
    );
  }
}
