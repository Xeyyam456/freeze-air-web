import type { SupabaseClient } from "@supabase/supabase-js";

// Qrup tapşırığı (0071) hər üzvə ayrıca iş qeydi yaradır, amma bu BİR işdir: ümumi (şirkət, komanda) saylarda bir dəfə sayılır.
// Ustanın öz sayı dəyişmir (hər üzv öz işini görür). İş qeydi → qrup (tapşırığın `group_id`-si).
export async function fetchGroupMap(supabase: SupabaseClient, from: string): Promise<Map<number, string>> {
  const { data } = await supabase.from("tasks").select("work_log_id, group_id")
    .not("group_id", "is", null).not("work_log_id", "is", null).gte("task_date", from).limit(5000);
  return new Map((data ?? []).map((t) => [t.work_log_id as number, t.group_id as string]));
}

// Eyni qrupun işləri bir açardır
export const jobKey = (id: number, groups: Map<number, string>) => groups.get(id) ?? `l${id}`;
