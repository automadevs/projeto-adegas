import { describe, expect, it } from "vitest";

import { asBranchId, asTenantId, asUserId } from "@adegaos/domain";

import {
  AuthSessionError,
  createSessionToken,
  extractBearerToken,
  verifySessionToken
} from "../src";

const secret = "test-session-secret-32-characters";
const principal = {
  tenantId: asTenantId("tenant-1"),
  branchId: asBranchId("branch-1"),
  userId: asUserId("user-1"),
  permissions: ["orders:finalize" as const],
  email: "user@example.com",
  displayName: "User One"
};

describe("session token", () => {
  it("round-trips a signed principal", () => {
    const session = createSessionToken(principal, {
      secret,
      now: new Date("2026-06-29T12:00:00.000Z"),
      ttlSeconds: 60
    });

    const verified = verifySessionToken(session.accessToken, {
      secret,
      now: new Date("2026-06-29T12:00:30.000Z")
    });

    expect(verified.tenantId).toBe(principal.tenantId);
    expect(verified.branchId).toBe(principal.branchId);
    expect(verified.userId).toBe(principal.userId);
    expect(verified.permissions).toEqual(principal.permissions);
  });

  it("rejects a tampered token", () => {
    const session = createSessionToken(principal, { secret });
    const last = session.accessToken.at(-1);
    const tampered = `${session.accessToken.slice(0, -1)}${last === "a" ? "b" : "a"}`;

    expect(() => verifySessionToken(tampered, { secret })).toThrow(AuthSessionError);
  });

  it("rejects an expired token", () => {
    const session = createSessionToken(principal, {
      secret,
      now: new Date("2026-06-29T12:00:00.000Z"),
      ttlSeconds: 1
    });

    expect(() =>
      verifySessionToken(session.accessToken, {
        secret,
        now: new Date("2026-06-29T12:00:02.000Z")
      })
    ).toThrow(AuthSessionError);
  });

  it("extracts bearer tokens only from valid authorization headers", () => {
    expect(extractBearerToken("Bearer abc.def.ghi")).toBe("abc.def.ghi");
    expect(() => extractBearerToken("Basic abc")).toThrow(AuthSessionError);
  });
});
