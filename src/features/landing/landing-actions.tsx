import Link from "next/link";
import { connection } from "next/server";
import { Button } from "@/components/ui/button";
import { auth, signIn } from "@/lib/auth";
import styles from "./landing-actions.module.scss";

export async function LandingActions() {
  await connection();
  const session = await auth();

  if (session?.user) {
    return (
      <div className={styles.actions}>
        <Link href="/boards" className={styles.primaryLink}>
          Open your boards
        </Link>
      </div>
    );
  }

  return (
    <div className={styles.actions}>
      <form
        action={async () => {
          "use server";
          await signIn("github", { redirectTo: "/boards" });
        }}
      >
        <Button type="submit">Sign in with GitHub</Button>
      </form>
      <a href="#demo" className={styles.secondaryLink}>
        Try the live demo
      </a>
    </div>
  );
}
