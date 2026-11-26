import { describe, expect, it } from "vitest";
import { wouldLeaveNoOwner } from "./rules";

const oneOwner = [
  { id: "a", role: "OWNER" as const },
  { id: "b", role: "EDITOR" as const },
];
const twoOwners = [
  { id: "a", role: "OWNER" as const },
  { id: "b", role: "OWNER" as const },
];

describe("wouldLeaveNoOwner", () => {
  it("blocks demoting the only owner", () => {
    expect(wouldLeaveNoOwner(oneOwner, "a", "EDITOR")).toBe(true);
  });

  it("blocks removing the only owner", () => {
    expect(wouldLeaveNoOwner(oneOwner, "a", null)).toBe(true);
  });

  it("allows demoting one of two owners", () => {
    expect(wouldLeaveNoOwner(twoOwners, "a", "VIEWER")).toBe(false);
  });

  it("allows removing a non-owner", () => {
    expect(wouldLeaveNoOwner(oneOwner, "b", null)).toBe(false);
  });

  it("allows promoting someone else", () => {
    expect(wouldLeaveNoOwner(oneOwner, "b", "OWNER")).toBe(false);
  });
});
