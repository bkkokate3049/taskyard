import type { Metadata } from "next";
import { Suspense } from "react";
import { LoadingRegion } from "@/components/ui/loading-region";
import { Skeleton } from "@/components/ui/skeleton";
import { InviteView } from "@/features/invites/invite-view";
import styles from "@/features/invites/invite.module.scss";

export const metadata: Metadata = {
  title: "Join a board",
  robots: { index: false },
  referrer: "no-referrer",
};

type InvitePageProps = {
  params: Promise<{ token: string }>;
};

export default function InvitePage({ params }: InvitePageProps) {
  return (
    <main className={styles.main}>
      <Suspense
        fallback={
          <LoadingRegion label="Loading invite">
            <Skeleton width="min(28rem, 90vw)" height="12rem" />
          </LoadingRegion>
        }
      >
        <InviteView params={params} />
      </Suspense>
    </main>
  );
}
