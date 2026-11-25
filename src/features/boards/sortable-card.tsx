"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { deleteCard, renameCard } from "./actions";
import { ConfirmDeleteForm } from "./confirm-delete-form";
import { RenameForm } from "./rename-form";
import type { CardData } from "./board-state";
import styles from "./board-view.module.scss";
import { memo } from "react";

type SortableCardProps = {
  card: CardData;
  columnId: string;
  canEdit: boolean;
};

export const SortableCard = memo(function SortableCard({
  card,
  columnId,
  canEdit,
}: SortableCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: card.id, data: { type: "card", columnId }, disabled: !canEdit });

  const classes = [styles.card, isDragging ? styles.dragging : ""]
    .filter(Boolean)
    .join(" ");

  return (
    <li
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={classes}
    >
      <div className={styles.cardHeader}>
        <p className={styles.cardTitle}>{card.title}</p>
        {canEdit ? (
          <button
            type="button"
            ref={setActivatorNodeRef}
            className={styles.handle}
            {...attributes}
            {...listeners}
            aria-label={`Move card ${card.title}`}
          >
            ⠿
          </button>
        ) : null}
      </div>
      <span className={styles.assignee}>{card.assigneeName ?? "Unassigned"}</span>
      {canEdit ? (
        <div className={styles.tools}>
          <RenameForm
            action={renameCard}
            id={card.id}
            value={card.title}
            maxLength={200}
            label={`Rename card ${card.title}`}
          />
          <ConfirmDeleteForm
            action={deleteCard}
            id={card.id}
            itemName={card.title}
            label={`Delete card ${card.title}`}
          />
        </div>
      ) : null}
    </li>
  );
});
