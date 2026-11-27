import { LoadingRegion } from "@/components/ui/loading-region";
import { Skeleton } from "@/components/ui/skeleton";
import styles from "./board-list.module.scss";

export function BoardListSkeleton() {
  return (
    <LoadingRegion label="Loading boards">
      <ul className={styles.grid}>
        {[0, 1, 2].map((item) => (
          <li key={item} className={styles.card}>
            <Skeleton width="60%" height="1.5rem" />
            <Skeleton width="4rem" height="1.25rem" />
          </li>
        ))}
      </ul>
    </LoadingRegion>
  );
}
