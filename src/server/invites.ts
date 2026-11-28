import "server-only";
import { db } from "@/lib/db";
import { hashInviteToken } from "@/lib/invite-token";

export function getInviteByToken(token: string) {
  return db.invite.findUnique({
    where: { tokenHash: hashInviteToken(token) },
    select: {
      role: true,
      revokedAt: true,
      expiresAt: true,
      maxUses: true,
      usedCount: true,
      board: { select: { id: true, title: true } },
    },
  });
}

export function getActiveInvites(boardId: string, now: Date) {
  return db.invite.findMany({
    where: { boardId, revokedAt: null, expiresAt: { gt: now } },
    orderBy: { createdAt: "desc" },
    select: { id: true, role: true, expiresAt: true, maxUses: true, usedCount: true },
  });
}
