import type { ReactNode } from "react";

type LoadingRegionProps = {
  label: string;
  children: ReactNode;
};

export function LoadingRegion({ label, children }: LoadingRegionProps) {
  return (
    <div role="status" aria-live="polite">
      <span className="visually-hidden">{label}</span>
      {children}
    </div>
  );
}
