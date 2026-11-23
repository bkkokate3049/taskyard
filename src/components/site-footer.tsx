import { site } from "@/lib/site";
import styles from "./site-footer.module.scss";

export function SiteFooter() {
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <p className={styles.text}>
          <strong>{site.name}</strong> is a portfolio project built with Next.js,
          TypeScript, Prisma and PostgreSQL.
        </p>
        <a
          href={site.repoUrl}
          className={styles.link}
          target="_blank"
          rel="noopener noreferrer"
        >
          View source on GitHub
          <span className="visually-hidden"> (opens in a new tab)</span>
        </a>
      </div>
    </footer>
  );
}
