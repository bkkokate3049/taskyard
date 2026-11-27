import styles from "./skeleton.module.scss";

type SkeletonProps = {
  width?: string;
  height?: string;
  className?: string;
};

export function Skeleton({ width = "100%", height = "1rem", className }: SkeletonProps) {
  const classes = [styles.skeleton, className].filter(Boolean).join(" ");
  return <span className={classes} style={{ width, height }} aria-hidden="true" />;
}
