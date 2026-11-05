"use client";

import { useState } from "react";
import { useMonthSummary } from "@/components/work/MonthStats/hooks/useMonthSummary";
import { exportMonthXlsx } from "@/lib/export-month";
import { useMe } from "@/lib/me";
import { useData } from "@/lib/useData";
import { fetchMonthStats } from "@/services/myWork/monthStats";

// Panel: seçilmiş ay (qrafik, kalendar, ən çox işlənən yerlər) + cari ay (göstərici kartları).
// İki sorğu eyni açarla gedir: seçilmiş ay cari aydırsa keşdən bir dəfə yüklənir.
export function useMonthView() {
  const [today] = useState(() => { const t = new Date(); return { y: t.getFullYear(), m: t.getMonth(), d: t.getDate() }; });
  const [ym, setYm] = useState({ y: today.y, m: today.m });
  const meCard = useMe(); // undefined = yüklənir, null = əməkdaş kartı yoxdur
  const me = meCard === null ? null : meCard?.id;
  const fetchFor = (y: number, m: number) => () => (me ? fetchMonthStats(me, y, m) : Promise.resolve(null));
  const data = useData("month-stats", fetchFor(ym.y, ym.m), [me, ym.y, ym.m]);
  const current = useData("month-stats", fetchFor(today.y, today.m), [me, today.y, today.m]);
  const [cumulative, setCumulative] = useState(false);
  const [table, setTable] = useState(false);
  const [exporting, setExporting] = useState(false);
  const days = new Date(ym.y, ym.m + 1, 0).getDate();
  const isCurrent = ym.y === today.y && ym.m === today.m;
  const stats = useMonthSummary(data, days);
  const currentStats = useMonthSummary(current, new Date(today.y, today.m + 1, 0).getDate());
  const loaded = !!data && data.key === `${ym.y}-${ym.m}`;

  return {
    me, today, ym, days, isCurrent, data, stats, loaded,
    current: current ? currentStats : null, prevCount: current?.prevCount ?? null,
    cumulative, setCumulative, table, toggleTable: () => setTable((t) => !t), exporting,
    prev: () => setYm((v) => (v.m === 0 ? { y: v.y - 1, m: 11 } : { y: v.y, m: v.m - 1 })),
    next: () => setYm((v) => (v.m === 11 ? { y: v.y + 1, m: 0 } : { y: v.y, m: v.m + 1 })),
    toToday: () => setYm({ y: today.y, m: today.m }),
    exportXlsx: async () => {
      if (!me) return;
      setExporting(true);
      await exportMonthXlsx(me, ym.y, ym.m);
      setExporting(false);
    },
  };
}
