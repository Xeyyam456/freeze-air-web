import { jobKey } from "@/lib/jobs";
import type { WorkDay } from "@/types/clients";

// Bu ayın iş tarixləri (artan sırada); qrup işi bir sayılır
export function monthJobDates(logs: WorkDay[], groups: Map<number, string>) {
  const seen = new Set<string>();
  return logs
    .filter((w) => { const k = jobKey(w.id, groups); return !seen.has(k) && !!seen.add(k); })
    .map((w) => w.work_date)
    .sort();
}
