import type { Role } from "@/generated/prisma/enums";

type MemberSummary = { id: string; role: Role };

export function wouldLeaveNoOwner(
  members: MemberSummary[],
  memberId: string,
  nextRole: Role | null,
): boolean {
  const owners = members.filter((member) => {
    if (member.id !== memberId) return member.role === "OWNER";
    return nextRole === "OWNER";
  });
  return owners.length === 0;
}
