"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { createBoard, type CreateBoardState } from "./actions";
import styles from "./create-board-form.module.scss";

const initialState: CreateBoardState = {};

export function CreateBoardForm() {
  const [state, formAction, pending] = useActionState(createBoard, initialState);

  return (
    <form action={formAction} className={styles.form}>
      <label htmlFor="title" className={styles.label}>
        New board
      </label>
      <div className={styles.row}>
        <input
          id="title"
          name="title"
          type="text"
          required
          maxLength={80}
          placeholder="e.g. Website launch"
          defaultValue={state.title}
          className={styles.input}
          aria-invalid={state.error ? true : undefined}
          aria-describedby={state.error ? "title-error" : undefined}
        />
        <Button type="submit" disabled={pending}>
          {pending ? "Creating…" : "Create board"}
        </Button>
      </div>
      {state.error ? (
        <p id="title-error" role="alert" className={styles.error}>
          {state.error}
        </p>
      ) : null}
    </form>
  );
}
