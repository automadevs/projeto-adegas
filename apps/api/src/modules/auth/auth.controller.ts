import { Body, Controller, Get, Post, Req } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import type { Request } from "express";

import { AuthService } from "./auth.service";
import { loginSchema } from "./auth.schemas";
import { requirePrincipalFromRequest } from "./request-session";

@ApiTags("auth")
@Controller("auth")
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post("login")
  login(@Body() body: unknown) {
    return this.auth.login(loginSchema.parse(body));
  }

  @Post("refresh")
  refresh(@Req() request: Request) {
    return this.auth.refresh(requirePrincipalFromRequest(request));
  }

  @Post("logout")
  logout(@Req() request: Request) {
    return this.auth.logout(requirePrincipalFromRequest(request));
  }

  @Get("me")
  me(@Req() request: Request) {
    return this.auth.me(requirePrincipalFromRequest(request));
  }
}
