export type InviteStatus = "valid" | "revoked" | "expired" | "used-up";

type InviteState = {
  revokedAt: Date | null;
  expiresAt: Date;
  maxUses: number;
  usedCount: number;
};

export function getInviteStatus(invite: InviteState, now: Date): InviteStatus {
  if (invite.revokedAt) return "revoked";
  if (invite.expiresAt.getTime() <= now.getTime()) return "expired";
  if (invite.usedCount >= invite.maxUses) return "used-up";
  return "valid";
}

export function expiryFrom(now: Date, days: number): Date {
  return new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
}
