"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { env } from "@/lib/env";
import {
  generateInviteToken,
  hashInviteToken,
  INVITE_TOKEN_PATTERN,
} from "@/lib/invite-token";
import { canManageBoard } from "@/lib/roles";
import { getBoardRole } from "@/server/permissions";
import { expiryFrom, getInviteStatus } from "./rules";
import { createInviteSchema, revokeInviteSchema } from "./schemas";

const MAX_ACTIVE_INVITES = 20;
const NOT_FOUND = "That board no longer exists.";
const INVALID =
  "This invite link isn't valid anymore. Ask the board owner for a new one.";
const TRY_AGAIN = "Something went wrong. Please try again.";

export type CreateInviteState = { error?: string; link?: string };
export type InviteFormState = { error?: string; ok?: boolean };
export type AcceptInviteState = { error?: string };

export async function createInvite(
  _previous: CreateInviteState,
  formData: FormData,
): Promise<CreateInviteState> {
  const session = await auth();
  if (!session?.user?.id) return { error: "You must be signed in." };

  const parsed = createInviteSchema.safeParse({
    boardId: formData.get("boardId"),
    role: formData.get("role"),
    days: formData.get("days"),
    maxUses: formData.get("maxUses"),
  });
  if (!parsed.success)
    return { error: parsed.error.issues[0]?.message ?? "Invalid request." };
  const { boardId, role, days, maxUses } = parsed.data;

  const actorRole = await getBoardRole(boardId, session.user.id);
  if (actorRole === null) return { error: NOT_FOUND };
  if (!canManageBoard(actorRole))
    return { error: "Only owners can create invite links." };

  const now = new Date();
  const active = await db.invite.count({
    where: { boardId, revokedAt: null, expiresAt: { gt: now } },
  });
  if (active >= MAX_ACTIVE_INVITES) {
    return {
      error: `A board can have at most ${MAX_ACTIVE_INVITES} active invite links. Revoke one first.`,
    };
  }

  const token = generateInviteToken();
  try {
    await db.invite.create({
      data: {
        tokenHash: hashInviteToken(token),
        boardId,
        role,
        maxUses,
        expiresAt: expiryFrom(now, days),
        createdById: session.user.id,
      },
    });
  } catch {
    return { error: TRY_AGAIN };
  }

  revalidatePath(`/boards/${boardId}/members`);
  return { link: new URL(`/invite/${token}`, env.NEXT_PUBLIC_APP_URL).toString() };
}

export async function revokeInvite(
  _previous: InviteFormState,
  formData: FormData,
): Promise<InviteFormState> {
  const session = await auth();
  if (!session?.user?.id) return { error: "You must be signed in." };

  const parsed = revokeInviteSchema.safeParse({ inviteId: formData.get("id") });
  if (!parsed.success) return { error: "Invalid request." };
  const { inviteId } = parsed.data;

  const invite = await db.invite.findUnique({
    where: { id: inviteId },
    select: { boardId: true },
  });
  if (!invite) return { error: "That invite link no longer exists." };

  const actorRole = await getBoardRole(invite.boardId, session.user.id);
  if (actorRole === null) return { error: "That invite link no longer exists." };
  if (!canManageBoard(actorRole))
    return { error: "Only owners can revoke invite links." };

  await db.invite.updateMany({
    where: { id: inviteId, revokedAt: null },
    data: { revokedAt: new Date() },
  });

  revalidatePath(`/boards/${invite.boardId}/members`);
  return { ok: true };
}

export async function acceptInvite(
  _previous: AcceptInviteState,
  formData: FormData,
): Promise<AcceptInviteState> {
  const session = await auth();
  if (!session?.user?.id) return { error: "Sign in to join this board." };
  const userId = session.user.id;

  const token = formData.get("token");
  if (typeof token !== "string" || !INVITE_TOKEN_PATTERN.test(token))
    return { error: INVALID };

  const invite = await db.invite.findUnique({
    where: { tokenHash: hashInviteToken(token) },
    select: {
      id: true,
      boardId: true,
      role: true,
      revokedAt: true,
      expiresAt: true,
      maxUses: true,
      usedCount: true,
    },
  });
  if (!invite) return { error: INVALID };

  const existingRole = await getBoardRole(invite.boardId, userId);
  if (existingRole !== null) redirect(`/boards/${invite.boardId}`);

  if (getInviteStatus(invite, new Date()) !== "valid") return { error: INVALID };

  try {
    const claimed = await db.$transaction(async (tx) => {
      const result = await tx.invite.updateMany({
        where: { id: invite.id, usedCount: invite.usedCount, revokedAt: null },
        data: { usedCount: { increment: 1 } },
      });
      if (result.count === 0) return false;

      await tx.boardMember.createMany({
        data: [{ boardId: invite.boardId, userId, role: invite.role }],
        skipDuplicates: true,
      });
      return true;
    });
    if (!claimed)
      return { error: "This invite just changed. Please reload and try again." };
  } catch {
    return { error: TRY_AGAIN };
  }

  redirect(`/boards/${invite.boardId}`);
}
