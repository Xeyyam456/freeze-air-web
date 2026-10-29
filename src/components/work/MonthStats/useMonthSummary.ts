import { useMemo } from "react";
import type { MonthLog, MonthStatsData, MonthSummary } from "@/types/myWork";

// İş yeri: mağaza/filial (şirkətin adı ilə) | sabit məkanlı şirkət | siyahıda olmayan yer
function placeOf(l: MonthLog) {
  if (l.stores) return { key: `s:${l.stores.companies?.name}:${l.stores.name}`, label: `${l.stores.companies?.name ?? ""} · ${l.stores.name}` };
  if (l.companies) return { key: `c:${l.companies.name}`, label: l.companies.name };
  const t = l.place_text ?? "—";
  return { key: `t:${t}`, label: t };
}

// Ayın sayları: günlər üzrə iş, cəmi, iş görülən gün, fərqli yer, ən çox işlənən 5 yer
export function useMonthSummary(data: MonthStatsData | null, days: number): MonthSummary {
  return useMemo(() => {
    const counts = Array<number>(days).fill(0);
    const places = new Map<string, { label: string; n: number }>();
    for (const l of data?.logs ?? []) {
      const d = Number(l.work_date.slice(8, 10));
      if (d >= 1 && d <= days) counts[d - 1] += 1;
      const p = placeOf(l);
      const e = places.get(p.key) ?? { label: p.label, n: 0 };
      e.n += 1;
      places.set(p.key, e);
    }
    const total = counts.reduce((a, b) => a + b, 0);
    const active = counts.filter((c) => c > 0).length;
    const top = [...places.values()].sort((a, b) => b.n - a.n || a.label.localeCompare(b.label, "az")).slice(0, 5);
    return { counts, total, active, placeCount: places.size, top };
  }, [data, days]);
}
