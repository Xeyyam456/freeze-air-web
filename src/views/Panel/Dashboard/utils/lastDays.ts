import type { MiniBarsProps } from "@/types/panelDash";
import { MONTHS } from "@/components/work/MonthStats/utils/chart";

// Son n gün (bu gün daxil), ay sərhədini keçir: ayın əvvəlində keçən ayın son günləri də götürülür.
// cur / prev: cari və keçən ayın günlər üzrə iş sayı (1-ci gün = indeks 0)
export function lastDays(cur: number[], prev: number[], y: number, m: number, d: number, n = 7): MiniBarsProps["bars"] {
  const out: MiniBarsProps["bars"] = [];
  for (let back = n - 1; back >= 0; back--) {
    const date = new Date(y, m, d - back);
    const same = date.getMonth() === m;
    const day = date.getDate();
    const value = (same ? cur : prev)[day - 1] ?? 0;
    out.push({ label: String(day), value, tip: `${day} ${MONTHS[date.getMonth()].toLowerCase()} · ${value} iş` });
  }
  return out;
}
