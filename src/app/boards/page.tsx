import type { Metadata } from "next";
import { Suspense } from "react";
import { BoardList } from "@/features/boards/board-list";

export const metadata: Metadata = {
  title: "Your boards",
  robots: { index: false },
};

export default function BoardsPage() {
  return (
    <main>
      <h1>Your boards</h1>
      <Suspense fallback={<p>Loading boards…</p>}>
        <BoardList />
      </Suspense>
    </main>
  );
}
