"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { canEditBoard, canManageBoard } from "@/lib/roles";
import { getBoardRole } from "@/server/permissions";
import {
  createBoardSchema,
  createCardSchema,
  createColumnSchema,
  deleteCardSchema,
  deleteColumnSchema,
  moveCardSchema,
  moveColumnSchema,
  renameCardSchema,
  renameColumnSchema,
} from "./schemas";
import type { Role } from "@/generated/prisma/enums";
import { positionAt } from "./ordering";

const POSITION_STEP = 1000;
const MAX_COLUMNS = 20;
const MAX_CARDS_PER_COLUMN = 200;

export type FormState = {
  error?: string;
  title?: string;
  ok?: boolean;
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

const NOT_FOUND = "That item no longer exists.";
const FORBIDDEN = "You don't have permission to do that.";

function checkAccess(
  role: Role | null,
  allowed: (role: Role | null) => boolean,
): string | null {
  if (role === null) return NOT_FOUND;
  return allowed(role) ? null : FORBIDDEN;
}

export async function renameColumn(
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  const session = await auth();
  if (!session?.user?.id) return { error: "You must be signed in." };

  const parsed = renameColumnSchema.safeParse({
    columnId: formData.get("id"),
    title: formData.get("title"),
  });
  if (!parsed.success)
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  const { columnId, title } = parsed.data;

  const column = await db.column.findUnique({
    where: { id: columnId },
    select: { boardId: true },
  });
  if (!column) return { error: NOT_FOUND };

  const denied = checkAccess(
    await getBoardRole(column.boardId, session.user.id),
    canEditBoard,
  );
  if (denied) return { error: denied };

  await db.column.updateMany({ where: { id: columnId }, data: { title } });
  revalidatePath(`/boards/${column.boardId}`);
  return { ok: true };
}

export async function deleteColumn(
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  const session = await auth();
  if (!session?.user?.id) return { error: "You must be signed in." };

  const parsed = deleteColumnSchema.safeParse({ columnId: formData.get("id") });
  if (!parsed.success) return { error: "Invalid request." };
  const { columnId } = parsed.data;

  const column = await db.column.findUnique({
    where: { id: columnId },
    select: { boardId: true },
  });
  if (!column) return { error: NOT_FOUND };

  const denied = checkAccess(
    await getBoardRole(column.boardId, session.user.id),
    canManageBoard,
  );
  if (denied) return { error: denied };

  await db.column.deleteMany({ where: { id: columnId } });
  revalidatePath(`/boards/${column.boardId}`);
  return { ok: true };
}

export async function renameCard(
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  const session = await auth();
  if (!session?.user?.id) return { error: "You must be signed in." };

  const parsed = renameCardSchema.safeParse({
    cardId: formData.get("id"),
    title: formData.get("title"),
  });
  if (!parsed.success)
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  const { cardId, title } = parsed.data;

  const card = await db.card.findUnique({
    where: { id: cardId },
    select: { column: { select: { boardId: true } } },
  });
  if (!card) return { error: NOT_FOUND };
  const boardId = card.column.boardId;

  const denied = checkAccess(await getBoardRole(boardId, session.user.id), canEditBoard);
  if (denied) return { error: denied };

  await db.card.updateMany({ where: { id: cardId }, data: { title } });
  revalidatePath(`/boards/${boardId}`);
  return { ok: true };
}

export async function deleteCard(
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  const session = await auth();
  if (!session?.user?.id) return { error: "You must be signed in." };

  const parsed = deleteCardSchema.safeParse({ cardId: formData.get("id") });
  if (!parsed.success) return { error: "Invalid request." };
  const { cardId } = parsed.data;

  const card = await db.card.findUnique({
    where: { id: cardId },
    select: { column: { select: { boardId: true } } },
  });
  if (!card) return { error: NOT_FOUND };
  const boardId = card.column.boardId;

  const denied = checkAccess(await getBoardRole(boardId, session.user.id), canEditBoard);
  if (denied) return { error: denied };

  await db.card.deleteMany({ where: { id: cardId } });
  revalidatePath(`/boards/${boardId}`);
  return { ok: true };
}
export type MoveCardResult = { ok?: boolean; error?: string };

export async function moveCard(input: {
  cardId: string;
  toColumnId: string;
  index: number;
}): Promise<MoveCardResult> {
  const session = await auth();
  if (!session?.user?.id) return { error: "You must be signed in." };

  const parsed = moveCardSchema.safeParse(input);
  if (!parsed.success) return { error: "Invalid request." };
  const { cardId, toColumnId, index } = parsed.data;

  const card = await db.card.findUnique({
    where: { id: cardId },
    select: { column: { select: { boardId: true } } },
  });
  if (!card) return { error: NOT_FOUND };
  const boardId = card.column.boardId;

  const denied = checkAccess(await getBoardRole(boardId, session.user.id), canEditBoard);
  if (denied) return { error: denied };

  const target = await db.column.findFirst({
    where: { id: toColumnId, boardId },
    select: { id: true },
  });
  if (!target) return { error: NOT_FOUND };

  const siblings = await db.card.findMany({
    where: { columnId: toColumnId, id: { not: cardId } },
    orderBy: { position: "asc" },
    select: { id: true, position: true },
  });
  if (siblings.length >= MAX_CARDS_PER_COLUMN) {
    return { error: `A column can have at most ${MAX_CARDS_PER_COLUMN} cards.` };
  }

  const at = Math.min(index, siblings.length);
  const position = positionAt(
    siblings.map((sibling) => sibling.position),
    at,
  );

  try {
    if (position === null) {
      const orderedIds = siblings.map((sibling) => sibling.id);
      orderedIds.splice(at, 0, cardId);
      await db.$transaction(
        orderedIds.map((id, i) =>
          db.card.updateMany({
            where: { id },
            data: { columnId: toColumnId, position: (i + 1) * POSITION_STEP },
          }),
        ),
      );
    } else {
      await db.card.updateMany({
        where: { id: cardId },
        data: { columnId: toColumnId, position },
      });
    }
  } catch {
    return { error: "Couldn't move the card. Please try again." };
  }

  revalidatePath(`/boards/${boardId}`);
  return { ok: true };
}
export type MoveColumnResult = MoveCardResult;

export async function moveColumn(input: {
  columnId: string;
  index: number;
}): Promise<MoveColumnResult> {
  const session = await auth();
  if (!session?.user?.id) return { error: "You must be signed in." };

  const parsed = moveColumnSchema.safeParse(input);
  if (!parsed.success) return { error: "Invalid request." };
  const { columnId, index } = parsed.data;

  const column = await db.column.findUnique({
    where: { id: columnId },
    select: { boardId: true },
  });
  if (!column) return { error: NOT_FOUND };
  const { boardId } = column;

  const denied = checkAccess(await getBoardRole(boardId, session.user.id), canEditBoard);
  if (denied) return { error: denied };

  const siblings = await db.column.findMany({
    where: { boardId, id: { not: columnId } },
    orderBy: { position: "asc" },
    select: { id: true, position: true },
  });

  const at = Math.min(index, siblings.length);
  const position = positionAt(
    siblings.map((sibling) => sibling.position),
    at,
  );

  try {
    if (position === null) {
      const orderedIds = siblings.map((sibling) => sibling.id);
      orderedIds.splice(at, 0, columnId);
      await db.$transaction(
        orderedIds.map((id, i) =>
          db.column.updateMany({
            where: { id },
            data: { position: (i + 1) * POSITION_STEP },
          }),
        ),
      );
    } else {
      await db.column.updateMany({ where: { id: columnId }, data: { position } });
    }
  } catch {
    return { error: "Couldn't move the column. Please try again." };
  }

  revalidatePath(`/boards/${boardId}`);
  return { ok: true };
}
