"use client";

import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
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
  const { setNodeRef, isOver } = useDroppable({
    id: column.id,
    data: { type: "column" },
  });
  const dropZoneClasses = [styles.dropZone, isOver ? styles.over : ""]
    .filter(Boolean)
    .join(" ");

  return (
    <section className={styles.column} aria-labelledby={`column-${column.id}`}>
      <h2 id={`column-${column.id}`} className={styles.columnTitle}>
        {column.title}
        <span className={styles.count}>{column.cards.length}</span>
      </h2>

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

      <div ref={setNodeRef} className={dropZoneClasses}>
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
