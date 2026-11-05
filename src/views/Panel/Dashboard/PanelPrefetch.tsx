import { dehydrate, HydrationBoundary, QueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/server";
import { fetchMe } from "@/services/me/fetchMe";
import { fetchMonthStats } from "@/services/myWork/monthStats";
import { fetchMyDayStats } from "@/services/myWork/myDay";
import { fetchDayLogs } from "@/services/myWork/workHistory";
import { todayBaku } from "@/shared/utils/todayBaku";
import type { PanelPrefetchProps } from "@/types/panelDash";

// Panelin məlumatı serverdə, səhifə ilə birlikdə (prefetch): kartlar açılan an dolu gəlir.
// Əvvəl brauzerdə ardıcıl gedirdi (auth → me → kartlar), məlumat 2–3 san. sonra görünürdü.
// Açarlar brauzerdəki useData açarları ilə eynidir ([açar, ...deps]); TanStack keşi buradan götürür, 30 san. təkrar sorğulamır.
export async function PanelPrefetch({ children }: PanelPrefetchProps) {
  const supabase = await createClient();
  const qc = new QueryClient();
  const t = todayBaku();
  const y = Number(t.slice(0, 4));
  const m = Number(t.slice(5, 7)) - 1;
  const p = m === 0 ? { y: y - 1, m: 11 } : { y, m: m - 1 };

  const [me, logs] = await Promise.all([fetchMe(supabase), fetchDayLogs(t, supabase)]);
  qc.setQueryData(["me"], me);
  qc.setQueryData(["work-history", t], logs);
  const id = me.me?.id;
  if (id) {
    const [stats, cur, prev] = await Promise.all([
      fetchMyDayStats(id, supabase), fetchMonthStats(id, y, m, supabase), fetchMonthStats(id, p.y, p.m, supabase),
    ]);
    qc.setQueryData(["my-day-stats", id], stats);
    qc.setQueryData(["month-stats", id, y, m], cur);
    qc.setQueryData(["month-stats", id, p.y, p.m], prev);
  }
  return <HydrationBoundary state={dehydrate(qc)}>{children}</HydrationBoundary>;
}
