import { pointerWithin, rectIntersection, type CollisionDetection } from "@dnd-kit/core";

export const cardCollisionDetection: CollisionDetection = (args) => {
  const pointerHits = pointerWithin(args);
  const hits = pointerHits.length > 0 ? pointerHits : rectIntersection(args);
  const cardHit = hits.find(
    (hit) =>
      args.droppableContainers.find((container) => container.id === hit.id)?.data.current
        ?.type === "card",
  );
  return cardHit ? [cardHit] : hits;
};
