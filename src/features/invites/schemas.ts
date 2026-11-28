import { z } from "zod";

export const createInviteSchema = z.object({
  boardId: z.string().min(1),
  role: z.enum(["EDITOR", "VIEWER"]),
  days: z.coerce
    .number()
    .int()
    .refine(
      (value) => [1, 7, 30].includes(value),
      "Choose how long the link should last",
    ),
  maxUses: z.coerce
    .number()
    .int()
    .min(1, "Allow at least 1 use")
    .max(100, "Allow at most 100 uses"),
});

export const revokeInviteSchema = z.object({
  inviteId: z.string().min(1),
});
