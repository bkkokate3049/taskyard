"use client";

import { useActionState, useState } from "react";
import { Button } from "@/components/ui/button";
import type { FormState } from "./actions";
import styles from "./edit-controls.module.scss";

type FormAction = (state: FormState, formData: FormData) => Promise<FormState>;

type ConfirmDeleteFormProps = {
  action: FormAction;
  id: string;
  itemName: string;
  label: string;
};

const initialState: FormState = {};

export function ConfirmDeleteForm({
  action,
  id,
  itemName,
  label,
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
        Delete
      </Button>
    );
  }

  return (
    <DeleteConfirmation
      action={action}
      id={id}
      itemName={itemName}
      onCancel={() => setConfirming(false)}
    />
  );
}

type DeleteConfirmationProps = {
  action: FormAction;
  id: string;
  itemName: string;
  onCancel: () => void;
};

function DeleteConfirmation({ action, id, itemName, onCancel }: DeleteConfirmationProps) {
  const [state, formAction, pending] = useActionState(action, initialState);

  return (
    <form action={formAction} className={styles.form}>
      <input type="hidden" name="id" value={id} />
      <span className={styles.prompt}>Delete “{itemName}”?</span>
      <Button type="submit" variant="danger" disabled={pending}>
        {pending ? "Deleting…" : "Yes, delete"}
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
