import { createClient } from "@/lib/supabase/client";
import type { MonthLog, MonthStatsData } from "@/types/myWork";

const pad = (n: number) => String(n).padStart(2, "0");
const iso = (y: number, m: number, d: number) => `${y}-${pad(m + 1)}-${pad(d)}`;

// Seçilmiş ayın işləri + müqayisə üçün əvvəlki ayın sayı. Müqayisə həmişə əvvəlki ayın 1-dən sonuna qədər tam sayı ilədir
// (istifadəçi qərarı: "keçən ayın eyni günündən yox, hər ayın 1-dən sonuna qədər").
export async function fetchMonthStats(employeeId: number, y: number, m: number): Promise<MonthStatsData> {
  const supabase = createClient();
  const days = new Date(y, m + 1, 0).getDate();
  const py = m === 0 ? y - 1 : y;
  const pm = m === 0 ? 11 : m - 1;
  const pdays = new Date(py, pm + 1, 0).getDate();
  const [cur, prev] = await Promise.all([
    supabase.from("work_logs")
      .select("id, work_date, place_text, stores(name, companies(name)), companies(name)")
      .eq("employee_id", employeeId).gte("work_date", iso(y, m, 1)).lte("work_date", iso(y, m, days)),
    supabase.from("work_logs").select("id", { count: "exact", head: true })
      .eq("employee_id", employeeId).gte("work_date", iso(py, pm, 1)).lte("work_date", iso(py, pm, pdays)),
  ]);
  return { key: `${y}-${m}`, logs: (cur.data ?? []) as MonthLog[], prevCount: prev.count ?? 0 };
}
