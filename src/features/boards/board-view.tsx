import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { connection } from "next/server";
import { auth } from "@/lib/auth";
import { canEditBoard, canManageBoard } from "@/lib/roles";
import { getBoardForUser } from "@/server/boards";
import { BoardColumns } from "./board-columns";
import type { ColumnData } from "./board-state";
import styles from "./board-view.module.scss";

type BoardViewProps = {
  params: Promise<{ boardId: string }>;
};

export async function BoardView({ params }: BoardViewProps) {
  await connection();
  const { boardId } = await params;

  const session = await auth();
  if (!session?.user?.id) redirect("/");

  const board = await getBoardForUser(boardId, session.user.id);
  if (!board) notFound();

  const role = board.members[0]?.role;
  const columns: ColumnData[] = board.columns.map((column) => ({
    id: column.id,
    title: column.title,
    cards: column.cards.map((card) => ({
      id: card.id,
      title: card.title,
      assigneeName: card.assignee?.name ?? null,
    })),
  }));

  return (
    <>
      <header className={styles.header}>
        <Link href="/boards">Back to boards</Link>
        <h1 className={styles.title}>{board.title}</h1>
        <span className={styles.badge}>{role}</span>
      </header>

      <BoardColumns
        boardId={board.id}
        initialColumns={columns}
        canEdit={canEditBoard(role)}
        canManage={canManageBoard(role)}
      />
    </>
  );
}
