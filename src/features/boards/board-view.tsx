import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { connection } from "next/server";
import { auth } from "@/lib/auth";
import { getBoardForUser } from "@/server/boards";
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

  return (
    <>
      <header className={styles.header}>
        <Link href="/boards">Back to boards</Link>
        <h1 className={styles.title}>{board.title}</h1>
        <span className={styles.badge}>{board.members[0]?.role}</span>
      </header>

      <div className={styles.columns}>
        {board.columns.map((column) => (
          <section
            key={column.id}
            className={styles.column}
            aria-labelledby={`column-${column.id}`}
          >
            <h2 id={`column-${column.id}`} className={styles.columnTitle}>
              {column.title}
              <span className={styles.count}>{column.cards.length}</span>
            </h2>

            {column.cards.length === 0 ? (
              <p className={styles.empty}>No cards yet</p>
            ) : (
              <ul className={styles.cards}>
                {column.cards.map((card) => (
                  <li key={card.id} className={styles.card}>
                    <p>{card.title}</p>
                    <span className={styles.assignee}>
                      {card.assignee?.name ?? "Unassigned"}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        ))}
      </div>
    </>
  );
}
