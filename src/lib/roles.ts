import type { Role } from "@/generated/prisma/enums";

export function canEditBoard(role: Role | null | undefined): boolean {
  return role === "OWNER" || role === "EDITOR";
}

export function canManageBoard(role: Role | null | undefined): boolean {
  return role === "OWNER";
}
export const roleLabels: Record<Role, string> = {
  OWNER: "Owner",
  EDITOR: "Editor",
  VIEWER: "Viewer",
};
