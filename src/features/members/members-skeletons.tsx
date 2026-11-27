import { LoadingRegion } from "@/components/ui/loading-region";
import { Skeleton } from "@/components/ui/skeleton";
import styles from "./members-view.module.scss";

export function MembersSkeleton() {
  return (
    <LoadingRegion label="Loading members">
      <div className={styles.header}>
        <Skeleton width="16rem" height="2rem" />
      </div>
      <ul className={styles.list}>
        {[0, 1, 2].map((item) => (
          <li key={item} className={styles.row}>
            <div className={styles.person}>
              <Skeleton width="2.5rem" height="2.5rem" />
              <Skeleton width="10rem" height="1.25rem" />
            </div>
            <Skeleton width="8rem" height="2.25rem" />
          </li>
        ))}
      </ul>
    </LoadingRegion>
  );
}
