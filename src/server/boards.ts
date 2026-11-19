import "server-only";
import { db } from "@/lib/db";

export function getBoardsForUser(userId: string) {
  return db.board.findMany({
    where: { members: { some: { userId } } },
    orderBy: { updatedAt: "desc" },
    select: {
      id: true,
      title: true,
      members: { where: { userId }, select: { role: true } },
    },
  });
}
