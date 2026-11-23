import {
  Gauge,
  Keyboard,
  MoonStar,
  MousePointerClick,
  ShieldCheck,
  Users,
  type LucideIcon,
} from "lucide-react";

export type Feature = { title: string; description: string; icon: LucideIcon };

export const features: Feature[] = [
  {
    title: "Drag and drop",
    description:
      "Move cards between columns and reorder columns. Changes show instantly and save in the background.",
    icon: MousePointerClick,
  },
  {
    title: "Roles that matter",
    description:
      "Owners, editors and viewers. Permissions are enforced on the server, not just hidden in the interface.",
    icon: Users,
  },
  {
    title: "Keyboard friendly",
    description:
      "Pick up and move cards with the keyboard. Screen readers hear the card and column names.",
    icon: Keyboard,
  },
  {
    title: "Secure sign-in",
    description:
      "Sign in with GitHub, so no passwords are stored. Every input is validated on the server.",
    icon: ShieldCheck,
  },
  {
    title: "Fast by design",
    description:
      "Server-rendered pages, optimistic updates, and interactive code that loads only where it is needed.",
    icon: Gauge,
  },
  {
    title: "Light and dark",
    description:
      "Follows your system theme, with colors chosen for readable contrast in both.",
    icon: MoonStar,
  },
];

export const steps = [
  {
    title: "Sign in",
    description: "Use your GitHub account. There is nothing to set up.",
  },
  {
    title: "Create a board",
    description: "Start with To do, Doing and Done, or add your own columns.",
  },
  {
    title: "Move work forward",
    description: "Add cards and drag them across as the work progresses.",
  },
];

export const stack = [
  "Next.js",
  "TypeScript",
  "Prisma",
  "PostgreSQL",
  "Auth.js",
  "Zod",
  "Vitest",
  "GitHub Actions",
];
