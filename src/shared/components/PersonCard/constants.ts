import type { PersonStatus } from "@/types/employees";

export const STATUS_TONE: Record<PersonStatus["kind"], { dot: string; pill: string }> = {
  in: { dot: "bg-ok", pill: "bg-emerald-500/12 text-ok" },
  done: { dot: "bg-[#98a2b3]", pill: "bg-bg text-muted" },
  leave: { dot: "bg-amber-500", pill: "bg-amber-500/15 text-amber-300" },
  none: { dot: "", pill: "bg-bg text-muted" },
};
