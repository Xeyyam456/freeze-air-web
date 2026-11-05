import { fetchMe } from "@/services/me/fetchMe";
import { fetchMonthStats } from "@/services/myWork/monthStats";
import { fetchMyDayStats } from "@/services/myWork/myDay";
import { fetchDayLogs } from "@/services/myWork/workHistory";
import { todayBaku } from "@/shared/utils/todayBaku";
import type { PrefetchEntry } from "@/types/panel";
import type { DbClient } from "@/types/shared";
import { prefetchMonthAttendance } from "@/views/Attendance/queries/prefetchAttendance.server";

// Panel: "mən", günün işləri, bu ayın davamiyyəti ("Mənim bugünüm"), sonra mənə aid göstəricilər + cari və keçən ayın statistikası.
// Açarlar brauzerdəki useData ilə eynidir; tarix Bakı vaxtı ilə (server UTC-dədir).
export async function prefetchPanel(db: DbClient): Promise<PrefetchEntry[]> {
  const t = todayBaku();
  const y = Number(t.slice(0, 4));
  const m = Number(t.slice(5, 7)) - 1;
  const p = m === 0 ? { y: y - 1, m: 11 } : { y, m: m - 1 };

  const [me, logs, attendance] = await Promise.all([fetchMe(db), fetchDayLogs(t, db), prefetchMonthAttendance(db)]);
  const out: PrefetchEntry[] = [{ key: ["me"], data: me }, { key: ["work-history", t], data: logs }, attendance];
  const id = me.me?.id;
  if (!id) return out;
  const [stats, cur, prev] = await Promise.all([fetchMyDayStats(id, db), fetchMonthStats(id, y, m, db), fetchMonthStats(id, p.y, p.m, db)]);
  return [...out,
    { key: ["my-day-stats", id], data: stats },
    { key: ["month-stats", id, y, m], data: cur },
    { key: ["month-stats", id, p.y, p.m], data: prev },
  ];
}
