"use client";

import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  MouseSensor,
  pointerWithin,
  rectIntersection,
  TouchSensor,
  useDroppable,
  useSensor,
  useSensors,
  type Announcements,
  type CollisionDetection,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  findColumnId,
  moveCardInColumns,
  type CardData,
  type ColumnData,
} from "@/features/boards/board-state";
import { demoColumns } from "./demo-data";
import styles from "./demo-board.module.scss";

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

function DemoCard({ card, columnId }: { card: CardData; columnId: string }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({
      id: card.id,
      data: { type: "card", columnId },
    });
  const classes = [styles.card, isDragging ? styles.dragging : ""]
    .filter(Boolean)
    .join(" ");

  return (
    <li
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={classes}
      {...attributes}
      {...listeners}
      aria-label={`Move card ${card.title}`}
    >
      <p className={styles.cardTitle}>{card.title}</p>
      {card.assigneeName ? (
        <span className={styles.chip}>{card.assigneeName}</span>
      ) : null}
    </li>
  );
}

function DemoColumn({ column }: { column: ColumnData }) {
  const { setNodeRef, isOver } = useDroppable({
    id: column.id,
    data: { type: "column" },
  });
  const dropZoneClasses = [styles.dropZone, isOver ? styles.over : ""]
    .filter(Boolean)
    .join(" ");

  return (
    <section className={styles.column} aria-labelledby={`${column.id}-title`}>
      <h3 id={`${column.id}-title`} className={styles.columnTitle}>
        {column.title}
        <span className={styles.count}>{column.cards.length}</span>
      </h3>
      <div ref={setNodeRef} className={dropZoneClasses}>
        <SortableContext
          items={column.cards.map((card) => card.id)}
          strategy={verticalListSortingStrategy}
        >
          <ul className={styles.cards}>
            {column.cards.map((card) => (
              <DemoCard key={card.id} card={card} columnId={column.id} />
            ))}
          </ul>
        </SortableContext>
      </div>
    </section>
  );
}

export function DemoBoard() {
  const [columns, setColumns] = useState<ColumnData[]>(demoColumns);
  const [startColumns, setStartColumns] = useState<ColumnData[]>(demoColumns);
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 8 } }),
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
    setStartColumns(columns);
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
    if (!over) return;
    const cardId = String(active.id);
    const overId = String(over.id);

    setColumns((current) => {
      const fromColumn = findColumnId(current, cardId);
      const toColumn = findColumnId(current, overId);
      if (!fromColumn || !toColumn || fromColumn !== toColumn || overId === cardId)
        return current;

      const overIndex =
        current
          .find((column) => column.id === toColumn)
          ?.cards.findIndex((card) => card.id === overId) ?? -1;
      return overIndex >= 0
        ? moveCardInColumns(current, cardId, toColumn, overIndex)
        : current;
    });
  }

  function handleDragCancel() {
    setActiveId(null);
    setColumns(startColumns);
  }

  return (
    <div>
      <div className={styles.hintRow}>
        <p className={styles.hint}>
          Drag a card to another column, or reorder inside one.
        </p>
        <Button type="button" variant="secondary" onClick={() => setColumns(demoColumns)}>
          Reset demo
        </Button>
      </div>

      <DndContext
        id="demo-dnd"
        sensors={sensors}
        collisionDetection={collisionDetection}
        accessibility={{ announcements }}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
      >
        <div className={styles.board}>
          {columns.map((column) => (
            <DemoColumn key={column.id} column={column} />
          ))}
        </div>
        <DragOverlay>
          {activeCard ? <div className={styles.overlay}>{activeCard.title}</div> : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
