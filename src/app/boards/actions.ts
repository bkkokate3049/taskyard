"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { createBoardSchema } from "./schemas";

export type CreateBoardState = {
  error?: string;
  title?: string;
};

export async function createBoard(
  _previous: CreateBoardState,
  formData: FormData,
): Promise<CreateBoardState> {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "You must be signed in to create a board." };
  }

  const rawTitle = formData.get("title");
  const parsed = createBoardSchema.safeParse({ title: rawTitle });
  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "Invalid board name",
      title: typeof rawTitle === "string" ? rawTitle : "",
    };
  }

  await db.board.create({
    data: {
      title: parsed.data.title,
      members: { create: { userId: session.user.id, role: "OWNER" } },
      columns: {
        create: [
          { title: "To do", position: 1000 },
          { title: "Doing", position: 2000 },
          { title: "Done", position: 3000 },
        ],
      },
    },
  });

  revalidatePath("/boards");
  return {};
}
