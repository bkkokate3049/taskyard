import { Suspense } from "react";
import { AuthButton } from "@/components/auth-button";
import styles from "./page.module.scss";

export default function HomePage() {
  return (
    <main className={styles.main}>
      <h1 className={styles.title}>Taskyard</h1>
      <p className={styles.tagline}>A collaborative Kanban board for teams.</p>
      <Suspense fallback={<p>Loading…</p>}>
        <AuthButton />
      </Suspense>
    </main>
  );
}
