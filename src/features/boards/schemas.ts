import { z } from "zod";

export const createBoardSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Give your board a name")
    .max(80, "Keep the name under 80 characters"),
});

export type CreateBoardInput = z.infer<typeof createBoardSchema>;

const id = z.string().min(1);

export const createColumnSchema = z.object({
  boardId: id,
  title: z
    .string()
    .trim()
    .min(1, "Give the column a name")
    .max(60, "Keep the name under 60 characters"),
});

export const createCardSchema = z.object({
  boardId: id,
  columnId: id,
  title: z
    .string()
    .trim()
    .min(1, "Give the card a title")
    .max(200, "Keep the title under 200 characters"),
});
