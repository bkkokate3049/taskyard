import { describe, expect, it } from "vitest";
import { changeRoleSchema, removeMemberSchema } from "./schemas";

describe("member schemas", () => {
  it("accepts a valid role change", () => {
    expect(changeRoleSchema.safeParse({ memberId: "m1", role: "EDITOR" }).success).toBe(
      true,
    );
  });

  it("rejects an unknown role", () => {
    expect(changeRoleSchema.safeParse({ memberId: "m1", role: "ADMIN" }).success).toBe(
      false,
    );
  });

  it("requires a member id to remove", () => {
    expect(removeMemberSchema.safeParse({ memberId: "" }).success).toBe(false);
  });
});
