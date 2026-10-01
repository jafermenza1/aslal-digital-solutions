import { describe, expect, it } from "vitest";
import { calculateResellerAmounts } from "./reseller-engine";

describe("reseller engine", () => {
  it("calculates explicit reseller margin", () => {
    expect(calculateResellerAmounts({ listPrice: 1000, resellerPrice: 800, quantity: 3 })).toEqual({
      listAmount: 3000,
      resellerAmount: 2400,
      marginAmount: 600,
    });
  });
  it("rejects invalid quantity", () => {
    expect(() => calculateResellerAmounts({ listPrice: 1000, resellerPrice: 800, quantity: 0 })).toThrow();
  });
  it("rejects negative prices", () => {
    expect(() => calculateResellerAmounts({ listPrice: -1, resellerPrice: 0, quantity: 1 })).toThrow();
  });
});
