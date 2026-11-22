import { z } from "zod";

const id = z.string().min(1);

const boardTitle = z
  .string()
  .trim()
  .min(1, "Give your board a name")
  .max(80, "Keep the name under 80 characters");

const columnTitle = z
  .string()
  .trim()
  .min(1, "Give the column a name")
  .max(60, "Keep the name under 60 characters");

const cardTitle = z
  .string()
  .trim()
  .min(1, "Give the card a title")
  .max(200, "Keep the title under 200 characters");

export const createBoardSchema = z.object({ title: boardTitle });
export type CreateBoardInput = z.infer<typeof createBoardSchema>;

export const createColumnSchema = z.object({ boardId: id, title: columnTitle });
export const createCardSchema = z.object({ boardId: id, columnId: id, title: cardTitle });

export const renameColumnSchema = z.object({ columnId: id, title: columnTitle });
export const renameCardSchema = z.object({ cardId: id, title: cardTitle });

export const deleteColumnSchema = z.object({ columnId: id });
export const deleteCardSchema = z.object({ cardId: id });
