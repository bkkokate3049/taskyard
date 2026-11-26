"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { canManageBoard } from "@/lib/roles";
import { getBoardRole } from "@/server/permissions";
import { wouldLeaveNoOwner } from "./rules";
import { changeRoleSchema, removeMemberSchema } from "./schemas";

export type MemberFormState = { error?: string; ok?: boolean };

const NOT_FOUND = "That member no longer exists.";
const LAST_OWNER = "A board needs at least one owner.";
const TRY_AGAIN = "Couldn't save the change. Please try again.";

export async function changeMemberRole(
  _previous: MemberFormState,
  formData: FormData,
): Promise<MemberFormState> {
  const session = await auth();
  if (!session?.user?.id) return { error: "You must be signed in." };

  const parsed = changeRoleSchema.safeParse({
    memberId: formData.get("memberId"),
    role: formData.get("role"),
  });
  if (!parsed.success) return { error: "Invalid request." };
  const { memberId, role } = parsed.data;

  const target = await db.boardMember.findUnique({
    where: { id: memberId },
    select: { boardId: true },
  });
  if (!target) return { error: NOT_FOUND };
  const { boardId } = target;

  const actorRole = await getBoardRole(boardId, session.user.id);
  if (actorRole === null) return { error: NOT_FOUND };
  if (!canManageBoard(actorRole)) return { error: "Only owners can change roles." };

  try {
    const problem = await db.$transaction(
      async (tx) => {
        const members = await tx.boardMember.findMany({
          where: { boardId },
          select: { id: true, role: true },
        });
        if (!members.some((member) => member.id === memberId)) return NOT_FOUND;
        if (wouldLeaveNoOwner(members, memberId, role)) return LAST_OWNER;

        await tx.boardMember.update({ where: { id: memberId }, data: { role } });
        return null;
      },
      { isolationLevel: "Serializable" },
    );
    if (problem) return { error: problem };
  } catch {
    return { error: TRY_AGAIN };
  }

  revalidatePath(`/boards/${boardId}`, "layout");
  return { ok: true };
}

export async function removeMember(
  _previous: MemberFormState,
  formData: FormData,
): Promise<MemberFormState> {
  const session = await auth();
  if (!session?.user?.id) return { error: "You must be signed in." };

  const parsed = removeMemberSchema.safeParse({ memberId: formData.get("id") });
  if (!parsed.success) return { error: "Invalid request." };
  const { memberId } = parsed.data;

  const target = await db.boardMember.findUnique({
    where: { id: memberId },
    select: { boardId: true, userId: true },
  });
  if (!target) return { error: NOT_FOUND };
  const { boardId, userId } = target;

  const actorRole = await getBoardRole(boardId, session.user.id);
  if (actorRole === null) return { error: NOT_FOUND };

  const isSelf = userId === session.user.id;
  if (!isSelf && !canManageBoard(actorRole)) {
    return { error: "Only owners can remove other members." };
  }

  try {
    const problem = await db.$transaction(
      async (tx) => {
        const members = await tx.boardMember.findMany({
          where: { boardId },
          select: { id: true, role: true },
        });
        if (!members.some((member) => member.id === memberId)) return NOT_FOUND;
        if (wouldLeaveNoOwner(members, memberId, null)) return LAST_OWNER;

        await tx.card.updateMany({
          where: { assigneeId: userId, column: { boardId } },
          data: { assigneeId: null },
        });
        await tx.boardMember.delete({ where: { id: memberId } });
        return null;
      },
      { isolationLevel: "Serializable" },
    );
    if (problem) return { error: problem };
  } catch {
    return { error: TRY_AGAIN };
  }

  revalidatePath(`/boards/${boardId}`, "layout");
  if (isSelf) redirect("/boards");
  return { ok: true };
}
