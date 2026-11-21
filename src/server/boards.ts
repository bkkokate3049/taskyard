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
export function getBoardForUser(boardId: string, userId: string) {
  return db.board.findFirst({
    where: { id: boardId, members: { some: { userId } } },
    select: {
      id: true,
      title: true,
      members: { where: { userId }, select: { role: true } },
      columns: {
        orderBy: { position: "asc" },
        select: {
          id: true,
          title: true,
          cards: {
            orderBy: { position: "asc" },
            select: {
              id: true,
              title: true,
              assignee: { select: { name: true } },
            },
          },
        },
      },
    },
  });
}
