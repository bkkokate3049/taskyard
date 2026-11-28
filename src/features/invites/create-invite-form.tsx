"use client";

import { useActionState, useState } from "react";
import { Button } from "@/components/ui/button";
import { SubmitButton } from "@/components/ui/submit-button";
import { createInvite, type CreateInviteState } from "./actions";
import styles from "./invite-section.module.scss";

const initialState: CreateInviteState = {};

function InviteLink({ link }: { link: string }) {
  const [copyState, setCopyState] = useState<"idle" | "copied" | "failed">("idle");

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(link);
      setCopyState("copied");
    } catch {
      setCopyState("failed");
    }
  }

  return (
    <div className={styles.linkBox}>
      <label htmlFor="invite-link" className={styles.label}>
        Your invite link (shown only once)
      </label>
      <div className={styles.linkRow}>
        <input
          id="invite-link"
          readOnly
          value={link}
          className={`${styles.control} ${styles.linkInput}`}
        />
        <Button type="button" variant="secondary" onClick={copyLink}>
          Copy link
        </Button>
      </div>
      <p role="status" className={styles.status}>
        {copyState === "copied" ? "Copied to the clipboard." : null}
        {copyState === "failed"
          ? "Couldn't copy. Select the link and copy it by hand."
          : null}
      </p>
    </div>
  );
}

export function CreateInviteForm({ boardId }: { boardId: string }) {
  const [state, formAction] = useActionState(createInvite, initialState);

  return (
    <form action={formAction} className={styles.form}>
      <input type="hidden" name="boardId" value={boardId} />

      <div className={styles.field}>
        <label htmlFor="invite-role" className={styles.label}>
          Role
        </label>
        <select
          id="invite-role"
          name="role"
          defaultValue="EDITOR"
          className={styles.control}
        >
          <option value="EDITOR">Editor</option>
          <option value="VIEWER">Viewer</option>
        </select>
      </div>

      <div className={styles.field}>
        <label htmlFor="invite-days" className={styles.label}>
          Expires after
        </label>
        <select id="invite-days" name="days" defaultValue="7" className={styles.control}>
          <option value="1">1 day</option>
          <option value="7">7 days</option>
          <option value="30">30 days</option>
        </select>
      </div>

      <div className={styles.field}>
        <label htmlFor="invite-uses" className={styles.label}>
          Maximum uses
        </label>
        <input
          id="invite-uses"
          name="maxUses"
          type="number"
          min={1}
          max={100}
          defaultValue={5}
          className={`${styles.control} ${styles.number}`}
        />
      </div>

      <SubmitButton pendingLabel="Creating…">Create link</SubmitButton>

      {state.error ? (
        <p role="alert" className={styles.error}>
          {state.error}
        </p>
      ) : null}
      {state.link ? <InviteLink key={state.link} link={state.link} /> : null}
    </form>
  );
}
