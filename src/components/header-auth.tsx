import Image from "next/image";
import Link from "next/link";
import { connection } from "next/server";
import { Button } from "@/components/ui/button";
import { auth, signIn, signOut } from "@/lib/auth";
import styles from "./site-header.module.scss";

export async function HeaderAuth() {
  await connection();
  const session = await auth();
  const user = session?.user;

  if (!user) {
    return (
      <form
        action={async () => {
          "use server";
          await signIn("github", { redirectTo: "/boards" });
        }}
      >
        <Button type="submit">Sign in with GitHub</Button>
      </form>
    );
  }

  const name = user.name ?? user.email ?? "Account";

  return (
    <nav aria-label="Main" className={styles.nav}>
      <Link href="/boards" className={styles.link}>
        Boards
      </Link>
      <div className={styles.user}>
        {user.image ? (
          <Image
            src={user.image}
            alt=""
            width={32}
            height={32}
            className={styles.avatar}
          />
        ) : null}
        <span className={styles.userName}>{name}</span>
      </div>
      <form
        action={async () => {
          "use server";
          await signOut({ redirectTo: "/" });
        }}
      >
        <Button type="submit" variant="secondary">
          Sign out
        </Button>
      </form>
    </nav>
  );
}
