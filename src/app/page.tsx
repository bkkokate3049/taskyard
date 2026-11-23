import type { Metadata } from "next";
import { Suspense } from "react";
import { features, stack, steps } from "@/features/landing/content";
import { DemoBoard } from "@/features/landing/demo-board-lazy";
import { LandingActions } from "@/features/landing/landing-actions";
import styles from "./page.module.scss";

export const metadata: Metadata = {
  title: "Taskyard: collaborative Kanban boards for teams",
  description:
    "Taskyard is an open source Kanban board with drag and drop, role-based access and GitHub sign-in, built with Next.js, TypeScript and Prisma.",
  alternates: { canonical: "/" },
};

const actionsFallback = <div className={styles.actionsPlaceholder} aria-hidden="true" />;

export default function HomePage() {
  return (
    <main>
      <section className={styles.hero}>
        <div className={styles.heroInner}>
          <p className={styles.eyebrow}>Open source portfolio project</p>
          <h1 className={styles.headline}>
            Plan work. <span className={styles.gradient}>Move it forward.</span>
          </h1>
          <p className={styles.lead}>
            Taskyard is a Kanban board for small teams. Organize tasks into columns, drag
            them as work progresses, and control who can edit what.
          </p>
          <Suspense fallback={actionsFallback}>
            <LandingActions />
          </Suspense>
          <ul className={styles.stack} aria-label="Built with">
            {stack.map((item) => (
              <li key={item} className={styles.stackItem}>
                {item}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section id="demo" className={styles.section} aria-labelledby="demo-title">
        <h2 id="demo-title" className={styles.sectionTitle}>
          Try it right here
        </h2>
        <p className={styles.sectionLead}>
          This is a live demo. Nothing is saved, so play freely.
        </p>
        <div className={styles.window}>
          <div className={styles.windowBar} aria-hidden="true">
            <span />
            <span />
            <span />
          </div>
          <div className={styles.windowBody}>
            <DemoBoard />
          </div>
        </div>
      </section>

      <section className={styles.section} aria-labelledby="features-title">
        <h2 id="features-title" className={styles.sectionTitle}>
          Built with care
        </h2>
        <p className={styles.sectionLead}>
          The details that make a board pleasant and safe to use.
        </p>
        <ul className={styles.features}>
          {features.map(({ title, description, icon: Icon }) => (
            <li key={title} className={styles.feature}>
              <span className={styles.featureIcon}>
                <Icon size={20} aria-hidden="true" />
              </span>
              <h3 className={styles.featureTitle}>{title}</h3>
              <p className={styles.featureText}>{description}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className={styles.section} aria-labelledby="steps-title">
        <h2 id="steps-title" className={styles.sectionTitle}>
          How it works
        </h2>
        <ol className={styles.steps}>
          {steps.map((step) => (
            <li key={step.title} className={styles.step}>
              <h3 className={styles.featureTitle}>{step.title}</h3>
              <p className={styles.featureText}>{step.description}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className={styles.cta} aria-labelledby="cta-title">
        <h2 id="cta-title" className={styles.sectionTitle}>
          Ready to try it?
        </h2>
        <p className={styles.sectionLead}>
          Sign in and create your first board in seconds.
        </p>
        <Suspense fallback={actionsFallback}>
          <LandingActions />
        </Suspense>
      </section>
    </main>
  );
}
