import {
  ConflictException,
  Injectable,
  UnauthorizedException
} from "@nestjs/common";

import {
  allPermissions,
  createSessionToken,
  type AuthenticatedPrincipal,
  type CreatedSessionToken,
  type Permission,
  type SessionPrincipal
} from "@adegaos/auth";
import { asBranchId, asTenantId, asUserId } from "@adegaos/domain";

import { PrismaService } from "../../shared/database/prisma.service";
import {
  DEMO_BRANCH_ID,
  DEMO_TENANT_ID,
  DEMO_USER_ID
} from "../operations/scope";
import { resolveAuthSecret } from "./auth-secret";
import type { LoginInput } from "./auth.schemas";

const demoEmail = "demo@adegaos.local";
const demoPassword = "demo";
const demoPasswordHash = "demo-user-without-login-yet";

export interface AuthPrincipalResponse {
  readonly userId: string;
  readonly tenantId: string;
  readonly branchId: string;
  readonly email?: string;
  readonly displayName?: string;
  readonly permissions: readonly Permission[];
  readonly sessionId?: string;
  readonly issuedAt?: string;
  readonly expiresAt?: string;
}

export interface AuthSessionResponse {
  readonly accessToken: string;
  readonly tokenType: "Bearer";
  readonly expiresAt: string;
  readonly principal: AuthPrincipalResponse;
}

@Injectable()
export class AuthService {
  constructor(private readonly prismaService: PrismaService) {}

  async login(input: LoginInput): Promise<AuthSessionResponse> {
    const email = input.email.toLowerCase();

    if (this.prismaService.isAvailable()) {
      const user = await this.findUserByEmail(email);

      if (user) {
        if (!this.acceptsPassword(user.passwordHash, input.password)) {
          throw new UnauthorizedException("Invalid credentials.");
        }

        return this.issueSession({
          tenantId: asTenantId(user.tenantId),
          branchId: asBranchId(user.branchId),
          userId: asUserId(user.id),
          email: user.email,
          displayName: user.displayName,
          permissions: allPermissions()
        });
      }
    }

    if (email === demoEmail && input.password === demoPassword) {
      return this.issueSession(await this.demoPrincipal());
    }

    throw new UnauthorizedException("Invalid credentials.");
  }

  refresh(principal: SessionPrincipal): AuthSessionResponse {
    return this.issueSession(principal);
  }

  logout(principal: SessionPrincipal): {
    readonly ok: true;
    readonly sessionId: string;
    readonly revoked: false;
  } {
    return {
      ok: true,
      sessionId: principal.sessionId,
      revoked: false
    };
  }

  me(principal: SessionPrincipal): AuthPrincipalResponse {
    return principalToResponse(principal);
  }

  private async findUserByEmail(email: string): Promise<DbUser | undefined> {
    const users = await this.prismaService.client.user.findMany({
      where: { email },
      take: 2
    });

    if (users.length > 1) {
      throw new ConflictException(
        "Email exists in more than one tenant; tenant-aware login is not wired yet."
      );
    }

    return users[0];
  }

  private acceptsPassword(passwordHash: string, password: string): boolean {
    if (passwordHash === demoPasswordHash) {
      return password === demoPassword;
    }

    if (process.env.NODE_ENV !== "production" && passwordHash.startsWith("plain:")) {
      return passwordHash.slice("plain:".length) === password;
    }

    return false;
  }

  private async demoPrincipal(): Promise<AuthenticatedPrincipal & {
    readonly email: string;
    readonly displayName: string;
  }> {
    if (this.prismaService.isAvailable()) {
      await this.ensureDemoUser();
    }

    return {
      tenantId: asTenantId(DEMO_TENANT_ID),
      branchId: asBranchId(DEMO_BRANCH_ID),
      userId: asUserId(DEMO_USER_ID),
      email: demoEmail,
      displayName: "Operador Demo",
      permissions: allPermissions()
    };
  }

  private async ensureDemoUser(): Promise<void> {
    const prisma = this.prismaService.client;

    await prisma.tenant.upsert({
      where: { id: DEMO_TENANT_ID },
      update: {},
      create: {
        id: DEMO_TENANT_ID,
        name: "Adega Demo"
      }
    });
    await prisma.branch.upsert({
      where: { id: DEMO_BRANCH_ID },
      update: {},
      create: {
        id: DEMO_BRANCH_ID,
        tenantId: DEMO_TENANT_ID,
        name: "Matriz"
      }
    });
    await prisma.user.upsert({
      where: { id: DEMO_USER_ID },
      update: {},
      create: {
        id: DEMO_USER_ID,
        tenantId: DEMO_TENANT_ID,
        branchId: DEMO_BRANCH_ID,
        email: demoEmail,
        passwordHash: demoPasswordHash,
        displayName: "Operador Demo"
      }
    });
  }

  private issueSession(
    principal: AuthenticatedPrincipal & {
      readonly email?: string;
      readonly displayName?: string;
    }
  ): AuthSessionResponse {
    const session = createSessionToken(principal, {
      secret: resolveAuthSecret()
    });

    return sessionToResponse(session);
  }
}

type DbUser = Awaited<
  ReturnType<PrismaUserLookup["findMany"]>
>[number];

interface PrismaUserLookup {
  findMany(input: {
    readonly where: { readonly email: string };
    readonly take: number;
  }): Promise<
    Array<{
      id: string;
      tenantId: string;
      branchId: string;
      email: string;
      passwordHash: string;
      displayName: string;
    }>
  >;
}

function sessionToResponse(session: CreatedSessionToken): AuthSessionResponse {
  return {
    accessToken: session.accessToken,
    tokenType: session.tokenType,
    expiresAt: session.expiresAt,
    principal: principalToResponse(session.principal)
  };
}

function principalToResponse(principal: SessionPrincipal): AuthPrincipalResponse {
  return {
    userId: principal.userId,
    tenantId: principal.tenantId,
    branchId: principal.branchId,
    email: principal.email,
    displayName: principal.displayName,
    permissions: principal.permissions,
    sessionId: principal.sessionId,
    issuedAt: principal.issuedAt,
    expiresAt: principal.expiresAt
  };
}
