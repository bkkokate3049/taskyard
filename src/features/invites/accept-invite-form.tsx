"use client";

import { useActionState } from "react";
import { SubmitButton } from "@/components/ui/submit-button";
import { acceptInvite, type AcceptInviteState } from "./actions";
import styles from "./invite.module.scss";

const initialState: AcceptInviteState = {};

export function AcceptInviteForm({
  token,
  roleLabel,
}: {
  token: string;
  roleLabel: string;
}) {
  const [state, formAction] = useActionState(acceptInvite, initialState);

  return (
    <form action={formAction} className={styles.form}>
      <input type="hidden" name="token" value={token} />
      <SubmitButton pendingLabel="Joining…">Join as {roleLabel}</SubmitButton>
      {state.error ? (
        <p role="alert" className={styles.error}>
          {state.error}
        </p>
      ) : null}
    </form>
  );
}
