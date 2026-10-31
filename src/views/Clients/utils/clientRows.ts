import { jobKey } from "@/lib/jobs";
import type { ClientListRaw, ClientRow, ClientTotals } from "@/types/clients";

// Siyahı sətirləri: filial sayı, koordinatlı say və bu ayın işi (qrup işi bir sayılır) + cəmlər
export function clientRows({ clients, works, groups }: ClientListRaw): { rows: ClientRow[]; totals: ClientTotals } {
  const monthWorks = new Map<number, number>();
  const seen = new Set<string>();
  for (const w of works) {
    const key = jobKey(w.id, groups);
    if (seen.has(key)) continue;
    seen.add(key);
    const id = w.company_id ?? w.s?.company_id;
    if (id != null) monthWorks.set(id, (monthWorks.get(id) ?? 0) + 1);
  }

  const rows = clients.map((c) => ({
    ...c,
    units: c.stores.length,
    coords: c.stores.filter((s) => s.lat != null && s.lng != null).length,
    works: monthWorks.get(c.id) ?? 0,
  }));
  const sum = (f: (r: ClientRow) => number) => rows.reduce((n, r) => n + f(r), 0);
  return {
    rows,
    totals: { units: sum((r) => r.units), coords: sum((r) => r.coords), works: sum((r) => r.works), fixed: rows.filter((r) => r.units === 0).length },
  };
}
