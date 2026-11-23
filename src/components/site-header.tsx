import Link from "next/link";
import { Suspense } from "react";
import { site } from "@/lib/site";
import { HeaderAuth } from "./header-auth";
import styles from "./site-header.module.scss";

export function SiteHeader() {
  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <Link href="/" className={styles.brand}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <rect x="3" y="4" width="5" height="16" rx="1.5" fill="currentColor" />
            <rect
              x="9.5"
              y="4"
              width="5"
              height="10"
              rx="1.5"
              fill="currentColor"
              opacity="0.7"
            />
            <rect
              x="16"
              y="4"
              width="5"
              height="13"
              rx="1.5"
              fill="currentColor"
              opacity="0.5"
            />
          </svg>
          <span>{site.name}</span>
        </Link>
        <Suspense fallback={<div className={styles.placeholder} aria-hidden="true" />}>
          <HeaderAuth />
        </Suspense>
      </div>
    </header>
  );
}
