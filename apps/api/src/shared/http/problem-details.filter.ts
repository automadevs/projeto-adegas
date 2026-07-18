import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  BadRequestException,
  HttpException,
  HttpStatus
} from "@nestjs/common";
import type { Response } from "express";
import { ZodError } from "zod";

import type { RequestWithCorrelationId } from "./correlation-id.middleware";

interface ProblemDetails {
  readonly type: string;
  readonly title: string;
  readonly status: number;
  readonly detail?: string;
  readonly instance?: string;
  readonly correlationId?: string;
}

@Catch()
export class ProblemDetailsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const http = host.switchToHttp();
    const response = http.getResponse<Response>();
    const request = http.getRequest<RequestWithCorrelationId>();

    const normalizedException =
      exception instanceof ZodError
        ? new BadRequestException(exception.issues.map((issue) => issue.message))
        : exception;

    const status =
      normalizedException instanceof HttpException
        ? normalizedException.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const problem: ProblemDetails = {
      type: status === HttpStatus.INTERNAL_SERVER_ERROR ? "about:blank" : "urn:adegaos:http-error",
      title: this.getTitle(normalizedException, status),
      status,
      detail: this.getDetail(normalizedException),
      instance: request.originalUrl,
      correlationId: request.correlationId
    };

    response.status(status).type("application/problem+json").json(problem);
  }

  private getTitle(exception: unknown, status: number): string {
    if (exception instanceof HttpException) {
      return exception.name;
    }

    return status === HttpStatus.INTERNAL_SERVER_ERROR
      ? "Internal Server Error"
      : "HTTP Error";
  }

  private getDetail(exception: unknown): string | undefined {
    if (
      !(exception instanceof HttpException) &&
      process.env.NODE_ENV !== "production" &&
      exception instanceof Error
    ) {
      return exception.message;
    }

    if (!(exception instanceof HttpException)) {
      return undefined;
    }

    const response = exception.getResponse();

    if (typeof response === "string") {
      return response;
    }

    if (isRecord(response) && typeof response.message === "string") {
      return response.message;
    }

    if (isRecord(response) && Array.isArray(response.message)) {
      return response.message.join("; ");
    }

    return undefined;
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}
