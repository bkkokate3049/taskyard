import type { Metadata } from "next";
import { Suspense } from "react";
import { MembersView } from "@/features/members/members-view";
import styles from "./page.module.scss";
import { MembersSkeleton } from "@/features/members/members-skeletons";

export const metadata: Metadata = {
  title: "Members",
  robots: { index: false },
};

type MembersPageProps = {
  params: Promise<{ boardId: string }>;
};

export default function MembersPage({ params }: MembersPageProps) {
  return (
    <main className={styles.main}>
      <Suspense fallback={<MembersSkeleton />}>
        <MembersView params={params} />
      </Suspense>
    </main>
  );
}
