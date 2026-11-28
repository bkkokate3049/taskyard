import { connection } from "next/server";
import { ConfirmDeleteForm } from "@/features/boards/confirm-delete-form";
import { roleLabels } from "@/lib/roles";
import { getActiveInvites } from "@/server/invites";
import { revokeInvite } from "./actions";
import { CreateInviteForm } from "./create-invite-form";
import styles from "./invite-section.module.scss";

const dateFormat = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

export async function InviteSection({ boardId }: { boardId: string }) {
  await connection();
  const invites = (await getActiveInvites(boardId, new Date())).filter(
    (invite) => invite.usedCount < invite.maxUses,
  );

  return (
    <section className={styles.section} aria-labelledby="invite-heading">
      <h2 id="invite-heading" className={styles.heading}>
        Invite people
      </h2>
      <p className={styles.hint}>
        Create a link and send it to someone. Anyone with the link can join with their
        GitHub account until it expires or runs out of uses. Owners are made from the list
        above.
      </p>

      <CreateInviteForm boardId={boardId} />

      {invites.length > 0 ? (
        <ul className={styles.list} aria-label="Active invite links">
          {invites.map((invite) => {
            const label = `${roleLabels[invite.role]} link`;
            return (
              <li key={invite.id} className={styles.item}>
                <div>
                  <p className={styles.itemTitle}>{label}</p>
                  <p className={styles.itemMeta}>
                    Expires {dateFormat.format(invite.expiresAt)}, used {invite.usedCount}{" "}
                    of {invite.maxUses}
                  </p>
                </div>
                <ConfirmDeleteForm
                  action={revokeInvite}
                  id={invite.id}
                  itemName={label}
                  label={`Revoke ${label}`}
                  actionLabel="Revoke"
                  confirmLabel="Yes, revoke"
                />
              </li>
            );
          })}
        </ul>
      ) : (
        <p className={styles.hint}>No active invite links.</p>
      )}
    </section>
  );
}
