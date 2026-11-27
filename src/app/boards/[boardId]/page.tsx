import type { Metadata } from "next";
import { Suspense } from "react";
import { BoardView } from "@/features/boards/board-view";
import styles from "./page.module.scss";
import { BoardSkeleton } from "@/features/boards/board-skeleton";

export const metadata: Metadata = {
  title: "Board",
  robots: { index: false },
};

type BoardPageProps = {
  params: Promise<{ boardId: string }>;
};

export default function BoardPage({ params }: BoardPageProps) {
  return (
    <main className={styles.main}>
      <Suspense fallback={<BoardSkeleton />}>
        <BoardView params={params} />
      </Suspense>
    </main>
  );
}
