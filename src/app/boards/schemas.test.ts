import { describe, expect, it } from "vitest";
import { createBoardSchema } from "./schemas";

describe("createBoardSchema", () => {
  it("trims the title", () => {
    const result = createBoardSchema.parse({ title: "  Website launch  " });
    expect(result.title).toBe("Website launch");
  });

  it("rejects a title that is only spaces", () => {
    expect(createBoardSchema.safeParse({ title: "   " }).success).toBe(false);
  });

  it("rejects a title longer than 80 characters", () => {
    expect(createBoardSchema.safeParse({ title: "a".repeat(81) }).success).toBe(false);
  });
});
