import type { BranchId, TenantId, TenantScope } from "@adegaos/domain";
import {
  asBranchId,
  asTenantId,
  asUserId
} from "@adegaos/domain";
import { createHmac, randomUUID, timingSafeEqual } from "node:crypto";

export type Permission =
  | "orders:create"
  | "orders:finalize"
  | "inventory:adjust"
  | "finance:read"
  | "cash:close"
  | "audit:read";

export interface AuthenticatedPrincipal extends TenantScope {
  readonly permissions: readonly Permission[];
}

export interface SessionPrincipal extends AuthenticatedPrincipal {
  readonly sessionId: string;
  readonly issuedAt: string;
  readonly expiresAt: string;
  readonly email?: string;
  readonly displayName?: string;
}

export interface CreateSessionTokenOptions {
  readonly secret: string;
  readonly now?: Date;
  readonly ttlSeconds?: number;
  readonly sessionId?: string;
}

export interface VerifySessionTokenOptions {
  readonly secret: string;
  readonly now?: Date;
}

export interface CreatedSessionToken {
  readonly accessToken: string;
  readonly tokenType: "Bearer";
  readonly expiresAt: string;
  readonly principal: SessionPrincipal;
}

export class AuthSessionError extends Error {
  constructor(
    message: string,
    readonly code: "missing" | "invalid" | "expired"
  ) {
    super(message);
    this.name = "AuthSessionError";
  }
}

const allowedPermissions: readonly Permission[] = [
  "orders:create",
  "orders:finalize",
  "inventory:adjust",
  "finance:read",
  "cash:close",
  "audit:read"
] as const;

const defaultTtlSeconds = 60 * 60 * 8;

export function hasPermission(
  principal: AuthenticatedPrincipal,
  permission: Permission
): boolean {
  return principal.permissions.includes(permission);
}

export function isSameScope(
  principal: TenantScope,
  tenantId: TenantId,
  branchId?: BranchId
): boolean {
  if (principal.tenantId !== tenantId) {
    return false;
  }

  return branchId === undefined || principal.branchId === branchId;
}

export function createSessionToken(
  principal: AuthenticatedPrincipal & {
    readonly email?: string;
    readonly displayName?: string;
  },
  options: CreateSessionTokenOptions
): CreatedSessionToken {
  assertSecret(options.secret);

  const now = options.now ?? new Date();
  const issuedAt = secondsFromDate(now);
  const expiresAt = issuedAt + (options.ttlSeconds ?? defaultTtlSeconds);
  const sessionId = options.sessionId ?? randomUUID();
  const payload: SessionTokenPayload = {
    sub: principal.userId,
    tenantId: principal.tenantId,
    branchId: principal.branchId,
    permissions: [...principal.permissions],
    iat: issuedAt,
    exp: expiresAt,
    sid: sessionId,
    email: principal.email,
    displayName: principal.displayName
  };
  const encodedHeader = encodeBase64UrlJson({
    alg: "HS256",
    typ: "JWT"
  });
  const encodedPayload = encodeBase64UrlJson(payload);
  const signature = sign(`${encodedHeader}.${encodedPayload}`, options.secret);
  const sessionPrincipal = payloadToPrincipal(payload);

  return {
    accessToken: `${encodedHeader}.${encodedPayload}.${signature}`,
    tokenType: "Bearer",
    expiresAt: sessionPrincipal.expiresAt,
    principal: sessionPrincipal
  };
}

export function verifySessionToken(
  token: string,
  options: VerifySessionTokenOptions
): SessionPrincipal {
  assertSecret(options.secret);

  const parts = token.split(".");

  if (parts.length !== 3) {
    throw new AuthSessionError("Malformed bearer token.", "invalid");
  }

  const [encodedHeader, encodedPayload, signature] = parts;

  if (!encodedHeader || !encodedPayload || !signature) {
    throw new AuthSessionError("Malformed bearer token.", "invalid");
  }

  const expectedSignature = sign(`${encodedHeader}.${encodedPayload}`, options.secret);

  if (!safeEquals(signature, expectedSignature)) {
    throw new AuthSessionError("Invalid bearer token signature.", "invalid");
  }

  const header = decodeBase64UrlJson(encodedHeader);

  if (!isRecord(header) || header.alg !== "HS256" || header.typ !== "JWT") {
    throw new AuthSessionError("Unsupported bearer token header.", "invalid");
  }

  const payload = decodeBase64UrlJson(encodedPayload);

  if (!isSessionTokenPayload(payload)) {
    throw new AuthSessionError("Invalid bearer token payload.", "invalid");
  }

  const now = secondsFromDate(options.now ?? new Date());

  if (payload.exp <= now) {
    throw new AuthSessionError("Bearer token expired.", "expired");
  }

  return payloadToPrincipal(payload);
}

export function extractBearerToken(authorizationHeader?: string | null): string | undefined {
  const normalized = authorizationHeader?.trim();

  if (!normalized) {
    return undefined;
  }

  const [scheme, token, extra] = normalized.split(/\s+/);

  if (scheme?.toLowerCase() !== "bearer" || !token || extra) {
    throw new AuthSessionError("Expected Authorization: Bearer <token>.", "invalid");
  }

  return token;
}

export function allPermissions(): readonly Permission[] {
  return allowedPermissions;
}

interface SessionTokenPayload {
  readonly sub: string;
  readonly tenantId: string;
  readonly branchId: string;
  readonly permissions: readonly Permission[];
  readonly iat: number;
  readonly exp: number;
  readonly sid: string;
  readonly email?: string;
  readonly displayName?: string;
}

function assertSecret(secret: string): void {
  if (secret.trim().length < 16) {
    throw new AuthSessionError("Session signing secret is not configured.", "invalid");
  }
}

function secondsFromDate(date: Date): number {
  return Math.floor(date.getTime() / 1000);
}

function sign(value: string, secret: string): string {
  return encodeBase64Url(createHmac("sha256", secret).update(value).digest());
}

function safeEquals(left: string, right: string): boolean {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);

  if (leftBuffer.byteLength !== rightBuffer.byteLength) {
    return false;
  }

  return timingSafeEqual(leftBuffer, rightBuffer);
}

function encodeBase64UrlJson(value: unknown): string {
  return encodeBase64Url(Buffer.from(JSON.stringify(value), "utf8"));
}

function encodeBase64Url(value: Buffer): string {
  return value
    .toString("base64")
    .replaceAll("+", "-")
    .replaceAll("/", "_")
    .replace(/=+$/u, "");
}

function decodeBase64UrlJson(value: string): unknown {
  try {
    const padded = value.padEnd(value.length + ((4 - (value.length % 4)) % 4), "=");
    const normalized = padded.replaceAll("-", "+").replaceAll("_", "/");

    return JSON.parse(Buffer.from(normalized, "base64").toString("utf8")) as unknown;
  } catch {
    throw new AuthSessionError("Invalid bearer token encoding.", "invalid");
  }
}

function payloadToPrincipal(payload: SessionTokenPayload): SessionPrincipal {
  return {
    tenantId: asTenantId(payload.tenantId),
    branchId: asBranchId(payload.branchId),
    userId: asUserId(payload.sub),
    permissions: payload.permissions,
    sessionId: payload.sid,
    issuedAt: new Date(payload.iat * 1000).toISOString(),
    expiresAt: new Date(payload.exp * 1000).toISOString(),
    email: payload.email,
    displayName: payload.displayName
  };
}

function isSessionTokenPayload(value: unknown): value is SessionTokenPayload {
  if (!isRecord(value)) {
    return false;
  }

  return (
    typeof value.sub === "string" &&
    typeof value.tenantId === "string" &&
    typeof value.branchId === "string" &&
    Array.isArray(value.permissions) &&
    value.permissions.every(isPermission) &&
    typeof value.iat === "number" &&
    Number.isInteger(value.iat) &&
    typeof value.exp === "number" &&
    Number.isInteger(value.exp) &&
    typeof value.sid === "string" &&
    (value.email === undefined || typeof value.email === "string") &&
    (value.displayName === undefined || typeof value.displayName === "string")
  );
}

function isPermission(value: unknown): value is Permission {
  return typeof value === "string" && allowedPermissions.includes(value as Permission);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}
