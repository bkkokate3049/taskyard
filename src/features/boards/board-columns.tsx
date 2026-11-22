"use client";

import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  pointerWithin,
  rectIntersection,
  useSensor,
  useSensors,
  type Announcements,
  type CollisionDetection,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { useState, useTransition } from "react";
import { moveCard } from "./actions";
import { AddColumnForm } from "./add-column-form";
import { BoardColumn } from "./board-column";
import { findColumnId, moveCardInColumns, type ColumnData } from "./board-state";
import styles from "./board-view.module.scss";

type BoardColumnsProps = {
  boardId: string;
  initialColumns: ColumnData[];
  canEdit: boolean;
  canManage: boolean;
};

const collisionDetection: CollisionDetection = (args) => {
  const pointerHits = pointerWithin(args);
  const hits = pointerHits.length > 0 ? pointerHits : rectIntersection(args);
  const cardHit = hits.find(
    (hit) =>
      args.droppableContainers.find((container) => container.id === hit.id)?.data.current
        ?.type === "card",
  );
  return cardHit ? [cardHit] : hits;
};

export function BoardColumns({
  boardId,
  initialColumns,
  canEdit,
  canManage,
}: BoardColumnsProps) {
  const [columns, setColumns] = useState(initialColumns);
  const [syncedFrom, setSyncedFrom] = useState(initialColumns);
  const [activeId, setActiveId] = useState<string | null>(null);
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

  const cards = columns.flatMap((column) => column.cards);
  const activeCard = activeId ? cards.find((card) => card.id === activeId) : undefined;

  const nameOf = (id: string | number) => {
    const key = String(id);
    return (
      columns.find((column) => column.id === key)?.title ??
      cards.find((card) => card.id === key)?.title ??
      "item"
    );
  };

  const announcements: Announcements = {
    onDragStart: ({ active }) => `Picked up card ${nameOf(active.id)}.`,
    onDragOver: ({ active, over }) =>
      over ? `Card ${nameOf(active.id)} is over ${nameOf(over.id)}.` : undefined,
    onDragEnd: ({ active, over }) =>
      over
        ? `Dropped card ${nameOf(active.id)} over ${nameOf(over.id)}.`
        : `Dropped card ${nameOf(active.id)}.`,
    onDragCancel: ({ active }) => `Move cancelled. Card ${nameOf(active.id)} returned.`,
  };

  function handleDragStart({ active }: DragStartEvent) {
    setActiveId(String(active.id));
    setError(null);
  }

  function handleDragOver({ active, over }: DragOverEvent) {
    if (!over) return;
    const cardId = String(active.id);
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
        const activeTop = active.rect.current.translated?.top ?? 0;
        const isBelow = activeTop > over.rect.top + over.rect.height / 2;
        index = overIndex + (isBelow ? 1 : 0);
      }
      return moveCardInColumns(current, cardId, toColumn, index);
    });
  }

  function handleDragEnd({ active, over }: DragEndEvent) {
    setActiveId(null);
    const cardId = String(active.id);

    let next = columns;
    if (over) {
      const overId = String(over.id);
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

  function handleDragCancel() {
    setActiveId(null);
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
        {columns.map((column) => (
          <BoardColumn
            key={column.id}
            boardId={boardId}
            column={column}
            canEdit={canEdit}
            canManage={canManage}
          />
        ))}
        {canEdit ? (
          <div className={styles.addColumn}>
            <AddColumnForm boardId={boardId} />
          </div>
        ) : null}
      </div>

      <DragOverlay>
        {activeCard ? <div className={styles.overlay}>{activeCard.title}</div> : null}
      </DragOverlay>
    </DndContext>
  );
}
