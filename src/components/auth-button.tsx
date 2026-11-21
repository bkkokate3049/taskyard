import { auth, signIn, signOut } from "@/lib/auth";
import { connection } from "next/server";
import styles from "./auth-button.module.scss";
import Link from "next/link";

export async function AuthButton() {
  await connection();
  const session = await auth();

  if (!session?.user) {
    return (
      <form
        className={styles.form}
        action={async () => {
          "use server";
          await signIn("github", { redirectTo: "/" });
        }}
      >
        <button type="submit">Sign in With GitHub</button>
      </form>
    );
  }
  return (
    <form
      className={styles.form}
      action={async () => {
        "use server";
        await signOut({ redirectTo: "/" });
      }}
    >
      <p>Signed in as {session.user.name ?? session.user.email}</p>
      <Link href="/boards">Go to your boards</Link>
      <button type="submit">Sign Out</button>
    </form>
  );
}
