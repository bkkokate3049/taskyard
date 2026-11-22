"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { canEditBoard } from "@/lib/roles";
import { getBoardRole } from "@/server/permissions";
import { createBoardSchema, createCardSchema, createColumnSchema } from "./schemas";

const POSITION_STEP = 1000;
const MAX_COLUMNS = 20;
const MAX_CARDS_PER_COLUMN = 200;

export type FormState = {
  error?: string;
  title?: string;
};

export type CreateBoardState = FormState;

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

export async function createColumn(
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  const session = await auth();
  if (!session?.user?.id) return { error: "You must be signed in." };

  const rawTitle = formData.get("title");
  const parsed = createColumnSchema.safeParse({
    boardId: formData.get("boardId"),
    title: rawTitle,
  });
  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "Invalid input",
      title: typeof rawTitle === "string" ? rawTitle : "",
    };
  }
  const { boardId, title } = parsed.data;

  const role = await getBoardRole(boardId, session.user.id);
  if (!canEditBoard(role)) {
    return { error: "You don't have permission to edit this board.", title };
  }

  const count = await db.column.count({ where: { boardId } });
  if (count >= MAX_COLUMNS) {
    return { error: `A board can have at most ${MAX_COLUMNS} columns.`, title };
  }

  const last = await db.column.aggregate({
    where: { boardId },
    _max: { position: true },
  });
  await db.column.create({
    data: { boardId, title, position: (last._max.position ?? 0) + POSITION_STEP },
  });

  revalidatePath(`/boards/${boardId}`);
  return {};
}

export async function createCard(
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  const session = await auth();
  if (!session?.user?.id) return { error: "You must be signed in." };

  const rawTitle = formData.get("title");
  const parsed = createCardSchema.safeParse({
    boardId: formData.get("boardId"),
    columnId: formData.get("columnId"),
    title: rawTitle,
  });
  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "Invalid input",
      title: typeof rawTitle === "string" ? rawTitle : "",
    };
  }
  const { boardId, columnId, title } = parsed.data;

  const role = await getBoardRole(boardId, session.user.id);
  if (!canEditBoard(role)) {
    return { error: "You don't have permission to edit this board.", title };
  }

  const column = await db.column.findFirst({
    where: { id: columnId, boardId },
    select: { id: true },
  });
  if (!column) return { error: "That column no longer exists.", title };

  const count = await db.card.count({ where: { columnId } });
  if (count >= MAX_CARDS_PER_COLUMN) {
    return { error: `A column can have at most ${MAX_CARDS_PER_COLUMN} cards.`, title };
  }

  const last = await db.card.aggregate({
    where: { columnId },
    _max: { position: true },
  });
  await db.card.create({
    data: { columnId, title, position: (last._max.position ?? 0) + POSITION_STEP },
  });

  revalidatePath(`/boards/${boardId}`);
  return {};
}
