import type { NextFunction, Request, Response } from "express";

import {
  CORRELATION_ID_HEADER,
  createCorrelationId
} from "@adegaos/observability";

export type RequestWithCorrelationId = Request & {
  correlationId?: string;
};

export function correlationIdMiddleware(
  request: RequestWithCorrelationId,
  response: Response,
  next: NextFunction
): void {
  const correlationId = createCorrelationId(request.header(CORRELATION_ID_HEADER));

  request.correlationId = correlationId;
  response.setHeader(CORRELATION_ID_HEADER, correlationId);
  next();
}
