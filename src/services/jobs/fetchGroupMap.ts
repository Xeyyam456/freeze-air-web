import type { SupabaseClient } from "@supabase/supabase-js";
import { fetchAll } from "@/lib/fetchAll";

// Qrup tapşırığı (0071) hər üzvə ayrıca iş qeydi yaradır, amma bu BİR işdir: ümumi (şirkət, komanda) saylarda bir dəfə sayılır.
// Ustanın öz sayı dəyişmir (hər üzv öz işini görür). İş qeydi → qrup (tapşırığın `group_id`-si).
// Aralıq İŞ tarixinə (work_logs.work_date) görədir: sabaha planlanıb bu gün görülən tapşırığın task_date-i fərqlidir.
export async function fetchGroupMap(supabase: SupabaseClient, from: string, to?: string): Promise<Map<number, string>> {
  // 1000-lik hissələrlə (fetchAll): Supabase bir sorğuda 1000-dən çox qaytarmır
  const data = await fetchAll((a, b) => {
    let q = supabase.from("tasks").select("work_log_id, group_id, work_logs!inner(work_date)")
      .not("group_id", "is", null).not("work_log_id", "is", null).gte("work_logs.work_date", from);
    if (to) q = q.lte("work_logs.work_date", to);
    return q.order("id").range(a, b);
  });
  return new Map(data.map((t: { work_log_id: number | null; group_id: string | null }) => [t.work_log_id as number, t.group_id as string]));
}
