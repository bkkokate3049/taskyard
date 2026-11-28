import Link from "next/link";
import { connection } from "next/server";
import type { ReactNode } from "react";
import { SubmitButton } from "@/components/ui/submit-button";
import { auth, signIn } from "@/lib/auth";
import { INVITE_TOKEN_PATTERN } from "@/lib/invite-token";
import { roleLabels } from "@/lib/roles";
import { getInviteByToken } from "@/server/invites";
import { getBoardRole } from "@/server/permissions";
import { AcceptInviteForm } from "./accept-invite-form";
import { getInviteStatus } from "./rules";
import styles from "./invite.module.scss";

function InviteCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className={styles.card}>
      <h1 className={styles.title}>{title}</h1>
      {children}
    </section>
  );
}

export async function InviteView({ params }: { params: Promise<{ token: string }> }) {
  await connection();
  const { token } = await params;

  const invite = INVITE_TOKEN_PATTERN.test(token) ? await getInviteByToken(token) : null;
  if (!invite || getInviteStatus(invite, new Date()) !== "valid") {
    return (
      <InviteCard title="This invite isn't valid">
        <p className={styles.text}>
          The link may have expired, been revoked, or been used up. Ask the board owner
          for a new one.
        </p>
        <Link href="/">Go to the home page</Link>
      </InviteCard>
    );
  }

  const session = await auth();
  const userId = session?.user?.id;
  const roleLabel = roleLabels[invite.role];

  if (!userId) {
    return (
      <InviteCard title={`Join “${invite.board.title}”`}>
        <p className={styles.text}>
          You have been invited as {roleLabel.toLowerCase()}. Sign in with GitHub to
          continue.
        </p>
        <form
          className={styles.form}
          action={async () => {
            "use server";
            await signIn("github", { redirectTo: `/invite/${token}` });
          }}
        >
          <SubmitButton pendingLabel="Redirecting…">Sign in with GitHub</SubmitButton>
        </form>
      </InviteCard>
    );
  }

  const existingRole = await getBoardRole(invite.board.id, userId);
  if (existingRole !== null) {
    return (
      <InviteCard title="You're already on this board">
        <Link href={`/boards/${invite.board.id}`}>Open “{invite.board.title}”</Link>
      </InviteCard>
    );
  }

  return (
    <InviteCard title={`Join “${invite.board.title}”`}>
      <p className={styles.text}>You have been invited as {roleLabel.toLowerCase()}.</p>
      <AcceptInviteForm token={token} roleLabel={roleLabel} />
    </InviteCard>
  );
}
