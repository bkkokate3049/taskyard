import Image from "next/image";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { connection } from "next/server";
import { ConfirmDeleteForm } from "@/features/boards/confirm-delete-form";
import { auth } from "@/lib/auth";
import { canManageBoard, roleLabels } from "@/lib/roles";
import { getBoardMembers } from "@/server/members";
import { removeMember } from "./actions";
import { MemberRoleForm } from "./member-role-form";
import styles from "./members-view.module.scss";

type MembersViewProps = {
  params: Promise<{ boardId: string }>;
};

export async function MembersView({ params }: MembersViewProps) {
  await connection();
  const { boardId } = await params;

  const session = await auth();
  if (!session?.user?.id) redirect("/");
  const userId = session.user.id;

  const board = await getBoardMembers(boardId, userId);
  if (!board) notFound();

  const myRole = board.members.find((member) => member.userId === userId)?.role;
  const canManage = canManageBoard(myRole);

  return (
    <>
      <header className={styles.header}>
        <Link href={`/boards/${board.id}`}>Back to board</Link>
        <h1 className={styles.title}>Members of {board.title}</h1>
      </header>

      <p className={styles.legend}>
        Owners manage members and can delete columns. Editors change cards and columns.
        Viewers can only look.
      </p>

      <ul className={styles.list}>
        {board.members.map((member) => {
          const name = member.user.name ?? member.user.email ?? "Unknown user";
          const isSelf = member.userId === userId;

          return (
            <li key={member.id} className={styles.row}>
              <div className={styles.person}>
                {member.user.image ? (
                  <Image
                    src={member.user.image}
                    alt=""
                    width={40}
                    height={40}
                    className={styles.avatar}
                  />
                ) : (
                  <span className={styles.avatarFallback} aria-hidden="true">
                    {name.slice(0, 1).toUpperCase()}
                  </span>
                )}
                <div>
                  <p className={styles.name}>
                    {name}
                    {isSelf ? " (you)" : ""}
                  </p>
                  {canManage && member.user.email ? (
                    <p className={styles.email}>{member.user.email}</p>
                  ) : null}
                </div>
              </div>

              <div className={styles.controls}>
                {canManage ? (
                  <MemberRoleForm
                    memberId={member.id}
                    name={name}
                    currentRole={member.role}
                  />
                ) : (
                  <span className={styles.role}>{roleLabels[member.role]}</span>
                )}
                {canManage || isSelf ? (
                  <ConfirmDeleteForm
                    action={removeMember}
                    id={member.id}
                    itemName={isSelf ? board.title : name}
                    label={isSelf ? `Leave ${board.title}` : `Remove ${name}`}
                    actionLabel={isSelf ? "Leave" : "Remove"}
                    confirmLabel={isSelf ? "Yes, leave" : "Yes, remove"}
                  />
                ) : null}
              </div>
            </li>
          );
        })}
      </ul>
    </>
  );
}
