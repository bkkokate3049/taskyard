import z from "zod";

export const roleSchema = z.enum(["OWNER", "EDITOR", "VIEWER"]);

export const changeRoleSchema = z.object({
  memberId: z.string().min(1),
  role: roleSchema,
});

export const removeMemberSchema = z.object({
  memberId: z.string().min(1),
});
