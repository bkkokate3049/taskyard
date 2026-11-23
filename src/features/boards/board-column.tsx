"use client";

import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { deleteColumn, renameColumn } from "./actions";
import { AddCardForm } from "./add-card-form";
import { ConfirmDeleteForm } from "./confirm-delete-form";
import { RenameForm } from "./rename-form";
import { SortableCard } from "./sortable-card";
import type { ColumnData } from "./board-state";
import styles from "./board-view.module.scss";

type BoardColumnProps = {
  boardId: string;
  column: ColumnData;
  canEdit: boolean;
  canManage: boolean;
};

export function BoardColumn({ boardId, column, canEdit, canManage }: BoardColumnProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
    isOver,
    active,
  } = useSortable({ id: column.id, data: { type: "column" }, disabled: !canEdit });

  const isCardOver = isOver && active?.data.current?.type === "card";
  const columnClasses = [styles.column, isDragging ? styles.dragging : ""]
    .filter(Boolean)
    .join(" ");
  const dropZoneClasses = [styles.dropZone, isCardOver ? styles.over : ""]
    .filter(Boolean)
    .join(" ");

  return (
    <section
      ref={setNodeRef}
      style={{ transform: CSS.Translate.toString(transform), transition }}
      className={columnClasses}
      aria-labelledby={`column-${column.id}`}
    >
      <div className={styles.columnHeader}>
        <h2 id={`column-${column.id}`} className={styles.columnTitle}>
          {column.title}
          <span className={styles.count}>{column.cards.length}</span>
        </h2>
        {canEdit ? (
          <button
            type="button"
            ref={setActivatorNodeRef}
            className={styles.handle}
            {...attributes}
            {...listeners}
            aria-label={`Move column ${column.title}`}
          >
            ⠿
          </button>
        ) : null}
      </div>

      {canEdit ? (
        <div className={styles.tools}>
          <RenameForm
            action={renameColumn}
            id={column.id}
            value={column.title}
            maxLength={60}
            label={`Rename column ${column.title}`}
          />
          {canManage ? (
            <ConfirmDeleteForm
              action={deleteColumn}
              id={column.id}
              itemName={column.title}
              label={`Delete column ${column.title}`}
            />
          ) : null}
        </div>
      ) : null}

      <div className={dropZoneClasses}>
        <SortableContext
          items={column.cards.map((card) => card.id)}
          strategy={verticalListSortingStrategy}
        >
          {column.cards.length > 0 ? (
            <ul className={styles.cards}>
              {column.cards.map((card) => (
                <SortableCard
                  key={card.id}
                  card={card}
                  columnId={column.id}
                  canEdit={canEdit}
                />
              ))}
            </ul>
          ) : (
            <p className={styles.empty}>No cards yet</p>
          )}
        </SortableContext>
      </div>

      {canEdit ? (
        <AddCardForm boardId={boardId} columnId={column.id} columnTitle={column.title} />
      ) : null}
    </section>
  );
}
