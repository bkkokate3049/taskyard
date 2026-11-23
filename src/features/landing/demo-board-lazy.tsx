"use client";

import dynamic from "next/dynamic";
import styles from "./demo-board.module.scss";

export const DemoBoard = dynamic(
  () => import("./demo-board").then((module) => module.DemoBoard),
  {
    ssr: false,
    loading: () => <div className={styles.skeleton} aria-hidden="true" />,
  },
);
