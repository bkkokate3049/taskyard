"use client";

import {
  closestCenter,
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type Announcements,
  type CollisionDetection,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import {
  horizontalListSortingStrategy,
  SortableContext,
  sortableKeyboardCoordinates,
} from "@dnd-kit/sortable";
import { useMemo, useState, useTransition } from "react";
import { moveCard, moveColumn } from "./actions";
import { AddColumnForm } from "./add-column-form";
import { BoardColumn } from "./board-column";
import {
  findColumnId,
  moveCardInColumns,
  moveColumnInColumns,
  type ColumnData,
} from "./board-state";
import styles from "./board-view.module.scss";
import { cardCollisionDetection } from "./collision";

type BoardColumnsProps = {
  boardId: string;
  initialColumns: ColumnData[];
  canEdit: boolean;
  canManage: boolean;
};

type ActiveItem = { id: string; type: "card" | "column" };

const collisionDetection: CollisionDetection = (args) => {
  if (args.active.data.current?.type === "column") {
    return closestCenter({
      ...args,
      droppableContainers: args.droppableContainers.filter(
        (container) => container.data.current?.type === "column",
      ),
    });
  }
  return cardCollisionDetection(args);
};

export function BoardColumns({
  boardId,
  initialColumns,
  canEdit,
  canManage,
}: BoardColumnsProps) {
  const [columns, setColumns] = useState(initialColumns);
  const [syncedFrom, setSyncedFrom] = useState(initialColumns);
  const [active, setActive] = useState<ActiveItem | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  if (initialColumns !== syncedFrom) {
    setSyncedFrom(initialColumns);
    setColumns(initialColumns);
  }

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const cards = useMemo(() => columns.flatMap((column) => column.cards), [columns]);
  const activeCard =
    active?.type === "card" ? cards.find((card) => card.id === active.id) : undefined;
  const activeColumn =
    active?.type === "column"
      ? columns.find((column) => column.id === active.id)
      : undefined;

  const nameOf = (id: string | number) => {
    const key = String(id);
    return (
      columns.find((column) => column.id === key)?.title ??
      cards.find((card) => card.id === key)?.title ??
      "item"
    );
  };
  const kindOf = (type: unknown) => (type === "column" ? "column" : "card");

  const announcements: Announcements = {
    onDragStart: ({ active: item }) =>
      `Picked up ${kindOf(item.data.current?.type)} ${nameOf(item.id)}.`,
    onDragOver: ({ active: item, over }) =>
      over
        ? `${kindOf(item.data.current?.type)} ${nameOf(item.id)} is over ${nameOf(over.id)}.`
        : undefined,
    onDragEnd: ({ active: item, over }) =>
      over
        ? `Dropped ${kindOf(item.data.current?.type)} ${nameOf(item.id)} over ${nameOf(over.id)}.`
        : `Dropped ${kindOf(item.data.current?.type)} ${nameOf(item.id)}.`,
    onDragCancel: ({ active: item }) =>
      `Move cancelled. ${kindOf(item.data.current?.type)} ${nameOf(item.id)} returned.`,
  };

  function handleDragStart({ active: item }: DragStartEvent) {
    setActive({
      id: String(item.id),
      type: item.data.current?.type === "column" ? "column" : "card",
    });
    setError(null);
  }

  function handleDragOver({ active: item, over }: DragOverEvent) {
    if (!over || item.data.current?.type !== "card") return;
    const cardId = String(item.id);
    const overId = String(over.id);

    setColumns((current) => {
      const fromColumn = findColumnId(current, cardId);
      const toColumn = findColumnId(current, overId);
      if (!fromColumn || !toColumn || fromColumn === toColumn) return current;

      const target = current.find((column) => column.id === toColumn);
      if (!target) return current;

      let index = target.cards.length;
      const overIndex = target.cards.findIndex((card) => card.id === overId);
      if (overIndex >= 0) {
        const activeTop = item.rect.current.translated?.top ?? 0;
        const isBelow = activeTop > over.rect.top + over.rect.height / 2;
        index = overIndex + (isBelow ? 1 : 0);
      }
      return moveCardInColumns(current, cardId, toColumn, index);
    });
  }

  function finishColumnDrag(columnId: string, overId: string | null) {
    if (!overId || overId === columnId) return;
    const toIndex = columns.findIndex((column) => column.id === overId);
    if (toIndex < 0) return;

    setColumns(moveColumnInColumns(columns, columnId, toIndex));

    startTransition(async () => {
      const result = await moveColumn({ columnId, index: toIndex });
      if (result.error) {
        setError(result.error);
        setColumns(initialColumns);
      }
    });
  }

  function finishCardDrag(cardId: string, overId: string | null) {
    let next = columns;
    if (overId) {
      const fromColumn = findColumnId(columns, cardId);
      const toColumn = findColumnId(columns, overId);
      if (fromColumn && toColumn && fromColumn === toColumn && overId !== cardId) {
        const overIndex =
          columns
            .find((column) => column.id === toColumn)
            ?.cards.findIndex((card) => card.id === overId) ?? -1;
        if (overIndex >= 0)
          next = moveCardInColumns(columns, cardId, toColumn, overIndex);
      }
    }
    setColumns(next);

    const finalColumnId = findColumnId(next, cardId);
    const finalIndex =
      next
        .find((column) => column.id === finalColumnId)
        ?.cards.findIndex((card) => card.id === cardId) ?? -1;
    if (!finalColumnId || finalIndex < 0) return;

    const originalColumnId = findColumnId(initialColumns, cardId);
    const originalIndex =
      initialColumns
        .find((column) => column.id === originalColumnId)
        ?.cards.findIndex((card) => card.id === cardId) ?? -1;
    if (originalColumnId === finalColumnId && originalIndex === finalIndex) return;

    startTransition(async () => {
      const result = await moveCard({
        cardId,
        toColumnId: finalColumnId,
        index: finalIndex,
      });
      if (result.error) {
        setError(result.error);
        setColumns(initialColumns);
      }
    });
  }

  function handleDragEnd({ active: item, over }: DragEndEvent) {
    setActive(null);
    const overId = over ? String(over.id) : null;

    if (item.data.current?.type === "column") {
      finishColumnDrag(String(item.id), overId);
    } else {
      finishCardDrag(String(item.id), overId);
    }
  }

  function handleDragCancel() {
    setActive(null);
    setColumns(initialColumns);
  }

  return (
    <DndContext
      id="board-dnd"
      sensors={sensors}
      collisionDetection={collisionDetection}
      accessibility={{ announcements }}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      {error ? (
        <p role="alert" className={styles.error}>
          {error}
        </p>
      ) : null}

      <div className={styles.columns} aria-busy={isPending}>
        <SortableContext
          items={columns.map((column) => column.id)}
          strategy={horizontalListSortingStrategy}
        >
          {columns.map((column) => (
            <BoardColumn
              key={column.id}
              boardId={boardId}
              column={column}
              canEdit={canEdit}
              canManage={canManage}
            />
          ))}
        </SortableContext>
        {canEdit ? (
          <div className={styles.addColumn}>
            <AddColumnForm boardId={boardId} />
          </div>
        ) : null}
      </div>

      <DragOverlay>
        {activeCard ? <div className={styles.overlay}>{activeCard.title}</div> : null}
        {activeColumn ? (
          <div className={styles.overlay}>
            {activeColumn.title} ({activeColumn.cards.length})
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
