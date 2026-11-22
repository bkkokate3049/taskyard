export type CardData = { id: string; title: string; assigneeName: string | null };
export type ColumnData = { id: string; title: string; cards: CardData[] };

export function findColumnId(columns: ColumnData[], id: string): string | undefined {
  if (columns.some((column) => column.id === id)) return id;
  return columns.find((column) => column.cards.some((card) => card.id === id))?.id;
}

export function moveCardInColumns(
  columns: ColumnData[],
  cardId: string,
  toColumnId: string,
  toIndex: number,
): ColumnData[] {
  const card = columns
    .flatMap((column) => column.cards)
    .find((item) => item.id === cardId);
  if (!card || !columns.some((column) => column.id === toColumnId)) return columns;

  return columns.map((column) => {
    const remaining = column.cards.filter((item) => item.id !== cardId);

    if (column.id !== toColumnId) {
      return remaining.length === column.cards.length
        ? column
        : { ...column, cards: remaining };
    }

    const index = Math.max(0, Math.min(toIndex, remaining.length));
    return {
      ...column,
      cards: [...remaining.slice(0, index), card, ...remaining.slice(index)],
    };
  });
}
