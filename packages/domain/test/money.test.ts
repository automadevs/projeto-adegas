import { describe, expect, it } from "vitest";

import { Money } from "../src";

describe("Money", () => {
  it("sums values in cents using bigint", () => {
    const total = Money.add(Money.fromCents(1200n), Money.fromCents("350"));

    expect(total).toBe(1550n);
  });

  it("rejects unsafe numeric input", () => {
    expect(() => Money.fromCents(Number.MAX_SAFE_INTEGER + 1)).toThrow(RangeError);
  });

  it("multiplies by integer quantity", () => {
    const total = Money.multiplyByQuantity(Money.fromCents(499n), 3);

    expect(total).toBe(1497n);
  });
});
