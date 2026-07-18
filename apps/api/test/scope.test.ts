import type { Request } from "express";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { createSessionToken } from "@adegaos/auth";
import { asBranchId, asTenantId, asUserId } from "@adegaos/domain";

import {
  DEMO_BRANCH_ID,
  DEMO_TENANT_ID,
  DEMO_USER_ID,
  scopeFromRequest
} from "../src/modules/operations/scope";

const secret = "api-test-session-secret-32-characters";
const sessionTenantId = "10000000-0000-4000-8000-000000000001";
const sessionBranchId = "10000000-0000-4000-8000-000000000101";
const sessionUserId = "10000000-0000-4000-8000-000000001001";

describe("scopeFromRequest", () => {
  const previousSecret = process.env.JWT_ACCESS_SECRET;

  beforeEach(() => {
    process.env.JWT_ACCESS_SECRET = secret;
  });

  afterEach(() => {
    if (previousSecret === undefined) {
      delete process.env.JWT_ACCESS_SECRET;
      return;
    }

    process.env.JWT_ACCESS_SECRET = previousSecret;
  });

  it("uses the signed session scope and ignores tenant headers when authenticated", () => {
    const session = createSessionToken(
      {
        tenantId: asTenantId(sessionTenantId),
        branchId: asBranchId(sessionBranchId),
        userId: asUserId(sessionUserId),
        permissions: ["orders:finalize" as const]
      },
      { secret }
    );
    const scope = scopeFromRequest(
      requestWithHeaders({
        authorization: `Bearer ${session.accessToken}`,
        "x-tenant-id": DEMO_TENANT_ID,
        "x-branch-id": DEMO_BRANCH_ID,
        "x-correlation-id": "corr-1"
      })
    );

    expect(scope).toEqual({
      tenantId: sessionTenantId,
      branchId: sessionBranchId,
      userId: sessionUserId,
      correlationId: "corr-1"
    });
  });

  it("keeps the demo fallback when no session or scope headers are present", () => {
    const scope = scopeFromRequest(requestWithHeaders({}));

    expect(scope.tenantId).toBe(DEMO_TENANT_ID);
    expect(scope.branchId).toBe(DEMO_BRANCH_ID);
    expect(scope.userId).toBe(DEMO_USER_ID);
  });
});

function requestWithHeaders(headers: Record<string, string>): Request {
  return { headers } as unknown as Request;
}
