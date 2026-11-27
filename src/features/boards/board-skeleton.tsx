import { LoadingRegion } from "@/components/ui/loading-region";
import { Skeleton } from "@/components/ui/skeleton";
import styles from "./board-view.module.scss";

const cardsPerColumn = [3, 2, 1];

export function BoardSkeleton() {
  return (
    <LoadingRegion label="Loading board">
      <div className={styles.header}>
        <Skeleton width="12rem" height="2rem" />
      </div>
      <div className={styles.columns}>
        {cardsPerColumn.map((count, column) => (
          <div key={column} className={styles.column}>
            <Skeleton width="50%" height="1.25rem" />
            {Array.from({ length: count }, (_, card) => (
              <Skeleton key={card} height="4.5rem" />
            ))}
          </div>
        ))}
      </div>
    </LoadingRegion>
  );
}
