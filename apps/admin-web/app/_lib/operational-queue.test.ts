import { describe, expect, it } from "vitest";

import { sectorForCategory } from "./operational-queue";

describe("sectorForCategory", () => {
  it("routes Refeicoes to kitchen, Drinks to bar and ignores other categories", () => {
    expect(sectorForCategory("Refeicoes")).toBe("kitchen");
    expect(sectorForCategory("Drinks")).toBe("bar");
    expect(sectorForCategory("Cervejas 600ml")).toBe("none");
    expect(sectorForCategory("Aguas")).toBe("none");
  });
});
