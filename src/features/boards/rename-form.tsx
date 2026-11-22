"use client";

import { useActionState, useState } from "react";
import type { FormState } from "./actions";
import { Button } from "@/components/ui/button";
import styles from "./edit-controls.module.scss";

type FormAction = (state: FormState, data: FormData) => Promise<FormState>;

type RenameFormProps = {
  action: FormAction;
  id: string;
  value: string;
  maxLength: number;
  label: string;
};
const initialState: FormState = {};

export function RenameForm({ action, id, value, maxLength, label }: RenameFormProps) {
  const [editing, setEditing] = useState(false);

  if (!editing) {
    return (
      <Button
        type="button"
        variant="secondary"
        aria-label="label"
        onClick={() => setEditing(true)}
      >
        Rename
      </Button>
    );
  }

  return (
    <RenameEditor
      action={action}
      id={id}
      value={value}
      label={label}
      maxLength={maxLength}
      onDone={() => setEditing(false)}
    />
  );
}
type RenameEditorProps = Omit<RenameFormProps, never> & { onDone: () => void };

export function RenameEditor({
  action,
  id,
  value,
  maxLength,
  label,
  onDone,
}: RenameEditorProps) {
  const [state, formAction, pending] = useActionState(
    async (previous: FormState, formData: FormData) => {
      const result = await action(previous, formData);
      if (result.ok) onDone();
      return result;
    },
    initialState,
  );
  const errorId = `rename-error-${id}`;
  return (
    <form action={formAction} className={styles.form}>
      <input type="hidden" name="id" value={id} />
      <input
        name="title"
        type="text"
        required
        maxLength={maxLength}
        defaultValue={value}
        aria-label={label}
        className={styles.input}
        aria-invalid={state.error ? true : undefined}
        aria-describedby={state.error ? errorId : undefined}
        autoFocus
      />
      <Button type="submit" disabled={pending}>
        {pending ? "Saving…" : "Save"}
      </Button>
      <Button type="button" variant="secondary" onClick={onDone}>
        Cancel
      </Button>
      {state.error ? (
        <p id={errorId} role="alert" className={styles.error}>
          {state.error}
        </p>
      ) : null}
    </form>
  );
}
