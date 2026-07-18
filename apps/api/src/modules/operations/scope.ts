import { BadRequestException } from "@nestjs/common";
import type { Request } from "express";

import {
  getSingleHeader,
  principalFromRequest
} from "../auth/request-session";

export const DEMO_TENANT_ID = "00000000-0000-4000-8000-000000000001";
export const DEMO_BRANCH_ID = "00000000-0000-4000-8000-000000000101";
export const DEMO_USER_ID = "00000000-0000-4000-8000-000000001001";

export interface RequestScope {
  readonly tenantId: string;
  readonly branchId: string;
  readonly userId: string;
  readonly correlationId?: string;
}

export function scopeFromRequest(request: Request): RequestScope {
  const principal = principalFromRequest(request);

  if (principal) {
    return {
      tenantId: principal.tenantId,
      branchId: principal.branchId,
      userId: principal.userId,
      correlationId: getSingleHeader(request, "x-correlation-id")
    };
  }

  const tenantId = getSingleHeader(request, "x-tenant-id") ?? DEMO_TENANT_ID;
  const branchId = getSingleHeader(request, "x-branch-id") ?? DEMO_BRANCH_ID;

  if (!isUuid(tenantId) || !isUuid(branchId)) {
    throw new BadRequestException("Invalid tenant or branch scope.");
  }

  return {
    tenantId,
    branchId,
    userId: DEMO_USER_ID,
    correlationId: getSingleHeader(request, "x-correlation-id")
  };
}

export function getIdempotencyKey(request: Request): string | undefined {
  const key = getSingleHeader(request, "idempotency-key")?.trim();
  return key && key.length > 0 ? key : undefined;
}

function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value
  );
}
