import { UnauthorizedException } from "@nestjs/common";
import type { Request } from "express";

import {
  AuthSessionError,
  extractBearerToken,
  verifySessionToken,
  type SessionPrincipal
} from "@adegaos/auth";

import { resolveAuthSecret } from "./auth-secret";

export function principalFromRequest(request: Request): SessionPrincipal | undefined {
  const authorization = getSingleHeader(request, "authorization");
  const token = extractBearerToken(authorization);

  if (!token) {
    return undefined;
  }

  try {
    return verifySessionToken(token, {
      secret: resolveAuthSecret()
    });
  } catch (error) {
    if (error instanceof AuthSessionError) {
      throw new UnauthorizedException(error.message);
    }

    throw error;
  }
}

export function requirePrincipalFromRequest(request: Request): SessionPrincipal {
  const principal = principalFromRequest(request);

  if (!principal) {
    throw new UnauthorizedException("Authentication is required.");
  }

  return principal;
}

export function getSingleHeader(request: Request, name: string): string | undefined {
  const value = request.headers[name];

  if (Array.isArray(value)) {
    return value[0];
  }

  return value;
}
