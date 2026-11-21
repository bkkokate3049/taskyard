import type { Metadata } from "next";
import { Suspense } from "react";
import { BoardList } from "@/features/boards/board-list";
import styles from "./page.module.scss";

export const metadata: Metadata = {
  title: "Your boards",
  robots: { index: false },
};

export default function BoardsPage() {
  return (
    <main className={styles.main}>
      <h1 className={styles.title}>Your boards</h1>
      <Suspense fallback={<p>Loading boards…</p>}>
        <BoardList />
      </Suspense>
    </main>
  );
}
