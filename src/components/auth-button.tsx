import { auth, signIn, signOut } from "@/lib/auth";
import { connection } from "next/server";

export async function AuthButton() {
  await connection();
  const session = await auth();

  if (!session?.user) {
    return (
      <form
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
      action={async () => {
        "use server";
        await signOut({ redirectTo: "/" });
      }}
    >
      <p>Signed in as {session.user.name ?? session.user.email}</p>
      <button type="submit">Sign Out</button>
    </form>
  );
}
