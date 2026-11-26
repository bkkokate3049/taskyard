import "server-only";
import { db } from "@/lib/db";

export function getBoardMembers(boardId: string, userId: string) {
  return db.board.findFirst({
    where: { id: boardId, members: { some: { userId } } },
    select: {
      id: true,
      title: true,
      members: {
        orderBy: { createdAt: "asc" },
        select: {
          id: true,
          role: true,
          userId: true,
          user: { select: { name: true, email: true, image: true } },
        },
      },
    },
  });
}
