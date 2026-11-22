import { describe, expect, it } from "vitest";
import { createBoardSchema, createCardSchema, createColumnSchema } from "./schemas";

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
describe("createColumnSchema", () => {
  it("accepts a valid column", () => {
    expect(createColumnSchema.safeParse({ boardId: "b1", title: "Review" }).success).toBe(
      true,
    );
  });

  it("rejects an empty title", () => {
    expect(createColumnSchema.safeParse({ boardId: "b1", title: "  " }).success).toBe(
      false,
    );
  });
});

describe("createCardSchema", () => {
  it("trims the title", () => {
    const result = createCardSchema.parse({
      boardId: "b1",
      columnId: "c1",
      title: "  Fix bug  ",
    });
    expect(result.title).toBe("Fix bug");
  });

  it("rejects a missing column id", () => {
    expect(createCardSchema.safeParse({ boardId: "b1", title: "Fix bug" }).success).toBe(
      false,
    );
  });
});
