"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import type { Role } from "@/generated/prisma/enums";
import { roleLabels } from "@/lib/roles";
import { changeMemberRole, type MemberFormState } from "./actions";
import styles from "./members-view.module.scss";

type MemberRoleFormProps = {
  memberId: string;
  name: string;
  currentRole: Role;
};

const initialState: MemberFormState = {};
const roles: Role[] = ["OWNER", "EDITOR", "VIEWER"];

export function MemberRoleForm({ memberId, name, currentRole }: MemberRoleFormProps) {
  const [state, formAction, pending] = useActionState(changeMemberRole, initialState);

  return (
    <form action={formAction} className={styles.roleForm}>
      <input type="hidden" name="memberId" value={memberId} />
      <select
        name="role"
        defaultValue={currentRole}
        aria-label={`Role for ${name}`}
        className={styles.select}
      >
        {roles.map((role) => (
          <option key={role} value={role}>
            {roleLabels[role]}
          </option>
        ))}
      </select>
      <Button type="submit" variant="secondary" disabled={pending}>
        {pending ? "Saving…" : "Save"}
      </Button>
      {state.error ? (
        <p role="alert" className={styles.error}>
          {state.error}
        </p>
      ) : null}
      {state.ok ? (
        <p role="status" className={styles.saved}>
          Saved
        </p>
      ) : null}
    </form>
  );
}
