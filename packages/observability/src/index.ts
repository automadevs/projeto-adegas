import { randomUUID } from "node:crypto";

export const CORRELATION_ID_HEADER = "x-correlation-id";

export function createCorrelationId(candidate?: string | null): string {
  const normalized = candidate?.trim();

  return normalized && normalized.length > 0 ? normalized : randomUUID();
}
