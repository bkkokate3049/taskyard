"use client";

import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef } from "react";
import styles from "./navigation-progress.module.scss";

const MAX_WAIT_MS = 8000;

export function NavigationProgress() {
  const pathname = usePathname();
  const barRef = useRef<HTMLDivElement>(null);
  const currentPath = useRef(pathname);
  const progress = useRef(0);
  const active = useRef(false);
  const timers = useRef({ trickle: 0, failSafe: 0, hide: 0 });

  const draw = useCallback((value: number, visible: boolean) => {
    const bar = barRef.current;
    if (!bar) return;
    bar.style.transform = `scaleX(${value})`;
    bar.style.opacity = visible ? "1" : "0";
  }, []);

  const finish = useCallback(() => {
    if (!active.current) return;
    active.current = false;
    const t = timers.current;
    window.clearInterval(t.trickle);
    window.clearTimeout(t.failSafe);
    draw(1, true);
    t.hide = window.setTimeout(() => {
      draw(1, false);
      t.hide = window.setTimeout(() => draw(0, false), 300);
    }, 200);
  }, [draw]);

  const start = useCallback(() => {
    if (active.current) return;
    active.current = true;
    const t = timers.current;
    window.clearTimeout(t.hide);
    progress.current = 0.08;
    draw(progress.current, true);
    t.trickle = window.setInterval(() => {
      progress.current += (0.9 - progress.current) * 0.1;
      draw(progress.current, true);
    }, 200);
    t.failSafe = window.setTimeout(finish, MAX_WAIT_MS);
  }, [draw, finish]);

  useEffect(() => {
    currentPath.current = pathname;
    finish();
  }, [pathname, finish]);

  useEffect(() => {
    function handleClick(event: MouseEvent) {
      if (event.button !== 0) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

      const anchor = (event.target as Element | null)?.closest("a");
      if (!anchor) return;
      if (anchor.target && anchor.target !== "_self") return;
      if (anchor.hasAttribute("download")) return;

      const url = new URL(anchor.href, window.location.href);
      if (url.origin !== window.location.origin) return;
      if (
        url.pathname === window.location.pathname &&
        url.search === window.location.search
      ) {
        return;
      }
      start();
    }

    function handlePopState() {
      if (window.location.pathname === currentPath.current) return;
      start();
    }

    document.addEventListener("click", handleClick);
    window.addEventListener("popstate", handlePopState);
    return () => {
      document.removeEventListener("click", handleClick);
      window.removeEventListener("popstate", handlePopState);
    };
  }, [start]);

  useEffect(() => {
    const t = timers.current;
    return () => {
      window.clearInterval(t.trickle);
      window.clearTimeout(t.failSafe);
      window.clearTimeout(t.hide);
    };
  }, []);

  return (
    <div className={styles.track} aria-hidden="true">
      <div ref={barRef} className={styles.bar} />
    </div>
  );
}
