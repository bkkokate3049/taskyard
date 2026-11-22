import { describe, expect, it } from "vitest";
import { canEditBoard } from "./roles";

describe("canEditBoard", () => {
  it("allows owners and editors", () => {
    expect(canEditBoard("OWNER")).toBe(true);
    expect(canEditBoard("EDITOR")).toBe(true);
  });

  it("rejects viewers and non-members", () => {
    expect(canEditBoard("VIEWER")).toBe(false);
    expect(canEditBoard(null)).toBe(false);
  });
});
