"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { createColumn, type FormState } from "./actions";
import styles from "./inline-form.module.scss";

const initialState: FormState = {};

export function AddColumnForm({ boardId }: { boardId: string }) {
  const [state, formAction, pending] = useActionState(createColumn, initialState);

  return (
    <form action={formAction} className={styles.form}>
      <input type="hidden" name="boardId" value={boardId} />
      <label htmlFor="new-column-title" className={styles.label}>
        New column
      </label>
      <input
        id="new-column-title"
        name="title"
        type="text"
        required
        maxLength={60}
        placeholder="e.g. Review"
        defaultValue={state.title}
        className={styles.input}
        aria-invalid={state.error ? true : undefined}
        aria-describedby={state.error ? "new-column-error" : undefined}
      />
      <Button type="submit" variant="secondary" disabled={pending}>
        {pending ? "Adding…" : "Add column"}
      </Button>
      {state.error ? (
        <p id="new-column-error" role="alert" className={styles.error}>
          {state.error}
        </p>
      ) : null}
    </form>
  );
}
