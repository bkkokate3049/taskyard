import { describe, expect, it } from "vitest";
import { positionAt } from "./ordering";

describe("positionAt", () => {
  it("uses the first step for an empty column", () => {
    expect(positionAt([], 0)).toBe(1000);
  });

  it("goes before the first item", () => {
    expect(positionAt([1000, 2000], 0)).toBe(0);
  });

  it("goes after the last item", () => {
    expect(positionAt([1000, 2000], 2)).toBe(3000);
    expect(positionAt([1000, 2000], 9)).toBe(3000);
  });

  it("goes between two items", () => {
    expect(positionAt([1000, 2000, 3000], 1)).toBe(1500);
  });

  it("asks for a renumber when the gap is too small", () => {
    expect(positionAt([1, 1.0000001], 1)).toBeNull();
  });
});
