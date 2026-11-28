import { describe, expect, it } from "vitest";
import { createInviteSchema } from "./schemas";

const valid = { boardId: "b1", role: "VIEWER", days: "7", maxUses: "5" };

describe("createInviteSchema", () => {
  it("accepts form values that arrive as strings", () => {
    const result = createInviteSchema.parse(valid);
    expect(result.days).toBe(7);
    expect(result.maxUses).toBe(5);
  });

  it("never allows an invite for the owner role", () => {
    expect(createInviteSchema.safeParse({ ...valid, role: "OWNER" }).success).toBe(false);
  });

  it("rejects unsupported durations", () => {
    expect(createInviteSchema.safeParse({ ...valid, days: "3" }).success).toBe(false);
  });

  it("rejects use limits outside 1 to 100", () => {
    expect(createInviteSchema.safeParse({ ...valid, maxUses: "0" }).success).toBe(false);
    expect(createInviteSchema.safeParse({ ...valid, maxUses: "101" }).success).toBe(
      false,
    );
  });
});
