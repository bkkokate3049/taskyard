import { redirect } from "next/navigation";
import { connection } from "next/server";
import { auth } from "@/lib/auth";
import { getBoardsForUser } from "@/server/boards";
import styles from "./board-list.module.scss";
import Link from "next/link";

export async function BoardList() {
  await connection();
  await new Promise((resolve) => setTimeout(resolve, 2000));
  const session = await auth();
  if (!session?.user?.id) redirect("/");

  const boards = await getBoardsForUser(session.user.id);
  if (boards.length === 0) return <p>You have no boards yet.</p>;

  return (
    <ul className={styles.grid}>
      {boards.map((board) => (
        <li key={board.id} className={styles.card}>
          <h2 className={styles.name}>
            <Link href={`/boards/${board.id}`} className={styles.link}>
              {board.title}
            </Link>
          </h2>
          <span className={styles.badge}>{board.members[0]?.role}</span>
        </li>
      ))}
    </ul>
  );
}
