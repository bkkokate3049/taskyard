import type { ColumnData } from "@/features/boards/board-state";

export const demoColumns: ColumnData[] = [
  {
    id: "demo-todo",
    title: "To do",
    cards: [
      { id: "demo-1", title: "Design the landing page", assigneeName: "Asha" },
      { id: "demo-2", title: "Write the README", assigneeName: "Ravi" },
      { id: "demo-3", title: "Plan the next release", assigneeName: null },
    ],
  },
  {
    id: "demo-doing",
    title: "Doing",
    cards: [
      { id: "demo-4", title: "Build drag and drop", assigneeName: "Asha" },
      { id: "demo-5", title: "Add role checks", assigneeName: "Ravi" },
    ],
  },
  {
    id: "demo-done",
    title: "Done",
    cards: [{ id: "demo-6", title: "Set up CI", assigneeName: "Asha" }],
  },
];
