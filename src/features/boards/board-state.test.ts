import { describe, expect, it } from "vitest";
import {
  findColumnId,
  moveCardInColumns,
  moveColumnInColumns,
  type ColumnData,
} from "./board-state";

const board: ColumnData[] = [
  {
    id: "todo",
    title: "To do",
    cards: [
      { id: "a", title: "A", assigneeName: null },
      { id: "b", title: "B", assigneeName: null },
    ],
  },
  { id: "doing", title: "Doing", cards: [{ id: "c", title: "C", assigneeName: null }] },
  { id: "done", title: "Done", cards: [] },
];

const ids = (columns: ColumnData[], columnId: string) =>
  columns.find((column) => column.id === columnId)?.cards.map((card) => card.id);

describe("findColumnId", () => {
  it("finds the column of a card and of a column id", () => {
    expect(findColumnId(board, "c")).toBe("doing");
    expect(findColumnId(board, "done")).toBe("done");
    expect(findColumnId(board, "missing")).toBeUndefined();
  });
});

describe("moveCardInColumns", () => {
  it("moves a card to another column at an index", () => {
    const next = moveCardInColumns(board, "a", "doing", 0);
    expect(ids(next, "todo")).toEqual(["b"]);
    expect(ids(next, "doing")).toEqual(["a", "c"]);
  });

  it("reorders inside the same column", () => {
    expect(ids(moveCardInColumns(board, "a", "todo", 1), "todo")).toEqual(["b", "a"]);
  });

  it("moves into an empty column and clamps the index", () => {
    expect(ids(moveCardInColumns(board, "b", "done", 99), "done")).toEqual(["b"]);
  });

  it("returns the same board for unknown ids", () => {
    expect(moveCardInColumns(board, "nope", "done", 0)).toBe(board);
    expect(moveCardInColumns(board, "a", "nope", 0)).toBe(board);
  });

  it("does not change the original board", () => {
    moveCardInColumns(board, "a", "doing", 0);
    expect(ids(board, "todo")).toEqual(["a", "b"]);
  });
});
describe("moveColumnInColumns", () => {
  const order = (columns: ColumnData[]) => columns.map((column) => column.id);

  it("moves a column to the end", () => {
    expect(order(moveColumnInColumns(board, "todo", 2))).toEqual([
      "doing",
      "done",
      "todo",
    ]);
  });

  it("moves a column to the start", () => {
    expect(order(moveColumnInColumns(board, "done", 0))).toEqual([
      "done",
      "todo",
      "doing",
    ]);
  });

  it("clamps the index", () => {
    expect(order(moveColumnInColumns(board, "todo", 99))).toEqual([
      "doing",
      "done",
      "todo",
    ]);
  });

  it("returns the same board for an unknown column", () => {
    expect(moveColumnInColumns(board, "nope", 0)).toBe(board);
  });

  it("does not change the original board", () => {
    moveColumnInColumns(board, "todo", 2);
    expect(order(board)).toEqual(["todo", "doing", "done"]);
  });
});
