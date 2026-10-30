import type { MyLeaveRow } from "@/types/leaves";

// Aylara görə qrup ("YYYY-MM" → sorğular), sıra olduğu kimi
export function groupByMonth(list: MyLeaveRow[]) {
  const byMonth = new Map<string, MyLeaveRow[]>();
  for (const l of list) {
    const k = l.date_from.slice(0, 7);
    byMonth.set(k, [...(byMonth.get(k) ?? []), l]);
  }
  return [...byMonth];
}
