import { describe, expect, it } from "vitest";
import {
  createBoardSchema,
  createCardSchema,
  createColumnSchema,
  deleteCardSchema,
  moveCardSchema,
  moveColumnSchema,
  renameCardSchema,
  renameColumnSchema,
} from "./schemas";

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

describe("rename and delete columns", () => {
  it("trims a rename and delete column", () => {
    const result = renameColumnSchema.parse({ columnId: "c1", title: "  Review  " });
    expect(result.title).toBe("Review");
  });

  it("rejects an empty card title", () => {
    expect(renameCardSchema.safeParse({ cardId: "K1", title: " " }).success).toBe(false);
  });

  it("requires an id to delete a card", () => {
    expect(deleteCardSchema.safeParse({ cardId: "" }).success).toBe(false);
  });
});

describe("moveCardSchema", () => {
  it("accepts a valid move", () => {
    expect(
      moveCardSchema.safeParse({ cardId: "a", toColumnId: "b", index: 0 }).success,
    ).toBe(true);
  });

  it("rejects a negative or fractional index", () => {
    expect(
      moveCardSchema.safeParse({ cardId: "a", toColumnId: "b", index: -1 }).success,
    ).toBe(false);
    expect(
      moveCardSchema.safeParse({ cardId: "a", toColumnId: "b", index: 1.5 }).success,
    ).toBe(false);
  });
});
describe("moveColumnSchema", () => {
  it("accepts a valid move", () => {
    expect(moveColumnSchema.safeParse({ columnId: "c1", index: 2 }).success).toBe(true);
  });

  it("rejects a negative index", () => {
    expect(moveColumnSchema.safeParse({ columnId: "c1", index: -1 }).success).toBe(false);
  });
});
