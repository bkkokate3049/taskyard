import "server-only";
import type { Role } from "@/generated/prisma/enums";
import { db } from "@/lib/db";

export async function getBoardRole(
  boardId: string,
  userId: string,
): Promise<Role | null> {
  const member = await db.boardMember.findUnique({
    where: { userId_boardId: { userId, boardId } },
    select: { role: true },
  });
  return member?.role ?? null;
}
