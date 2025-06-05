import { describe, it, expect } from "vitest";
import { calculateTotal } from "./calculateTotal";

describe("calculateTotal", () => {
  it("sums comma-separated values", () => {
    const input = "100, 200, 300";
    expect(calculateTotal(input)).toBe(600);
  });

  it("sums newline-separated values", () => {
    const input = "100\n200\n300";
    expect(calculateTotal(input)).toBe(600);
  });

  it("sums mixed comma and newline-separated values", () => {
    const input = "100\n200,300\n400";
    expect(calculateTotal(input)).toBe(1000);
  });

  it("ignores empty strings and whitespace", () => {
    const input = " 100 , \n 200\n\n , 300 ";
    expect(calculateTotal(input)).toBe(600);
  });

  it("skips invalid numbers", () => {
    const input = "100, abc, 200";
    expect(calculateTotal(input)).toBe(300);
  });

  it("returns 0 for empty input", () => {
    expect(calculateTotal("")).toBe(0);
  });

  it("returns 0 if input only has invalid data", () => {
    expect(calculateTotal("abc, xyz")).toBe(0);
  });
});
