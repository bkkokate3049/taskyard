import { redirect } from "next/navigation";
import { connection } from "next/server";
import { auth } from "@/lib/auth";
import { getBoardsForUser } from "@/server/boards";

export async function BoardList() {
  await connection();
  const session = await auth();
  if (!session?.user?.id) redirect("/");

  const boards = await getBoardsForUser(session.user.id);
  if (boards.length === 0) return <p>You have no boards yet.</p>;

  return (
    <ul>
      {boards.map((board) => (
        <li key={board.id}>
          {board.title} ({board.members[0]?.role})
        </li>
      ))}
    </ul>
  );
}
