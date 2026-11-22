"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { createCard, type FormState } from "./actions";
import styles from "./inline-form.module.scss";

const initialState: FormState = {};

type AddCardFormProps = {
  boardId: string;
  columnId: string;
  columnTitle: string;
};

export function AddCardForm({ boardId, columnId, columnTitle }: AddCardFormProps) {
  const [state, formAction, pending] = useActionState(createCard, initialState);
  const errorId = `new-card-error-${columnId}`;

  return (
    <form action={formAction} className={styles.form}>
      <input type="hidden" name="boardId" value={boardId} />
      <input type="hidden" name="columnId" value={columnId} />
      <input
        name="title"
        type="text"
        required
        maxLength={200}
        placeholder="Add a card"
        aria-label={`Add a card to ${columnTitle}`}
        defaultValue={state.title}
        className={styles.input}
        aria-invalid={state.error ? true : undefined}
        aria-describedby={state.error ? errorId : undefined}
      />
      <Button type="submit" variant="secondary" disabled={pending}>
        {pending ? "Adding…" : "Add card"}
      </Button>
      {state.error ? (
        <p id={errorId} role="alert" className={styles.error}>
          {state.error}
        </p>
      ) : null}
    </form>
  );
}
