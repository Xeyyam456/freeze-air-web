import type { PersonStatus } from "@/types/employees";

export const STATUS_TONE: Record<PersonStatus["kind"], { dot: string; pill: string }> = {
  in: { dot: "bg-ok", pill: "bg-[#e8f7ee] text-ok" },
  done: { dot: "bg-[#98a2b3]", pill: "bg-bg text-muted" },
  leave: { dot: "bg-amber-500", pill: "bg-[#fff6e5] text-amber-700" },
  none: { dot: "", pill: "bg-bg text-muted" },
};
