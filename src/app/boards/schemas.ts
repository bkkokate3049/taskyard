import { z } from "zod";

export const createBoardSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Give your board a name")
    .max(80, "Keep the name under 80 characters"),
});

export type CreateBoardInput = z.infer<typeof createBoardSchema>;
