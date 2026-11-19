import { Suspense } from "react";
import { AuthButton } from "@/components/auth-button";

export default function HomePage() {
  return (
    <main>
      <h1>Taskyard</h1>
      <p>A collaborative Kanban board for teams.</p>
      <Suspense fallback={<p>Loading…</p>}>
        <AuthButton />
      </Suspense>
    </main>
  );
}
