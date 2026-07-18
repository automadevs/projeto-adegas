import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { api } from "./api";

describe("api demo fallback", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("offline")));
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("returns demo products when the backend is unavailable", async () => {
    const result = await api("/items");

    expect(Array.isArray(result)).toBe(true);
    expect(result.some((item: { sku?: string }) => item.sku === "MENU-JANTINHA")).toBe(true);
  });
});
