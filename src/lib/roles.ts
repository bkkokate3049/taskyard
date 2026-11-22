import type { Role } from "@/generated/prisma/enums";

export function canEditBoard(role: Role | null | undefined): boolean {
  return role === "OWNER" || role === "EDITOR";
}
