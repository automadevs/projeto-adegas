import { ServiceUnavailableException } from "@nestjs/common";

const localDevelopmentSecret = "adegaos-local-development-session-secret";

export function resolveAuthSecret(): string {
  const configuredSecret =
    process.env.JWT_ACCESS_SECRET ?? process.env.ADEGAOS_AUTH_SECRET;

  if (configuredSecret && configuredSecret.trim().length >= 16) {
    return configuredSecret;
  }

  if (process.env.NODE_ENV === "production") {
    throw new ServiceUnavailableException("Authentication secret is not configured.");
  }

  return localDevelopmentSecret;
}
