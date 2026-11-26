"use client";

import { useActionState, useState } from "react";
import { Button } from "@/components/ui/button";
import styles from "./edit-controls.module.scss";

type ActionState = { error?: string; ok?: boolean };
type FormAction = (state: ActionState, formData: FormData) => Promise<ActionState>;

type ConfirmDeleteFormProps = {
  action: FormAction;
  id: string;
  itemName: string;
  label: string;
  actionLabel?: string;
  confirmLabel?: string;
};

const initialState: ActionState = {};

export function ConfirmDeleteForm({
  action,
  id,
  itemName,
  label,
  actionLabel = "Delete",
  confirmLabel = "Yes, delete",
}: ConfirmDeleteFormProps) {
  const [confirming, setConfirming] = useState(false);

  if (!confirming) {
    return (
      <Button
        type="button"
        variant="secondary"
        aria-label={label}
        onClick={() => setConfirming(true)}
      >
        {actionLabel}
      </Button>
    );
  }

  return (
    <DeleteConfirmation
      action={action}
      id={id}
      prompt={`${actionLabel} “${itemName}”?`}
      confirmLabel={confirmLabel}
      onCancel={() => setConfirming(false)}
    />
  );
}

type DeleteConfirmationProps = {
  action: FormAction;
  id: string;
  prompt: string;
  confirmLabel: string;
  onCancel: () => void;
};

function DeleteConfirmation({
  action,
  id,
  prompt,
  confirmLabel,
  onCancel,
}: DeleteConfirmationProps) {
  const [state, formAction, pending] = useActionState(action, initialState);

  return (
    <form action={formAction} className={styles.form}>
      <input type="hidden" name="id" value={id} />
      <span className={styles.prompt}>{prompt}</span>
      <Button type="submit" variant="danger" disabled={pending}>
        {pending ? "Working…" : confirmLabel}
      </Button>
      <Button type="button" variant="secondary" onClick={onCancel}>
        Cancel
      </Button>
      {state.error ? (
        <p role="alert" className={styles.error}>
          {state.error}
        </p>
      ) : null}
    </form>
  );
}
