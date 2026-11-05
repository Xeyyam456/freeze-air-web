import { mergeGroupLogs } from "@/lib/jobs";
import { fetchFileCounts } from "@/services/jobs/fetchFileCounts";
import { fetchGroupMap } from "@/services/jobs/fetchGroupMap";
import { createClient } from "@/lib/supabase/client";
import type { DbClient } from "@/types/shared";
import type { DayLogRow } from "@/types/myWork";

// Günün bütün işləri; qrup işi (bir neçə üzvə eyni tapşırıq) bir sətirdir və bir iş sayılır: "Xəyyam + Fərhad"
export async function fetchDayLogs(day: string, supabase: DbClient = createClient()): Promise<DayLogRow[]> {
  const [{ data }, groups] = await Promise.all([
    supabase
      .from("work_logs")
      .select("id, created_at, description, place_text, employees(full_name, photo_url), stores(name, companies(name)), companies(name)")
      .eq("work_date", day)
      .order("created_at", { ascending: false }),
    fetchGroupMap(supabase, day, day),
  ]);
  const merged = mergeGroupLogs((data ?? []) as DayLogRow[], groups);
  const files = await fetchFileCounts(supabase, merged.map((l) => l.id)); // ▶ Video / şəkil / akt (qrup üzrə)
  return merged.map((l) => ({ ...l, files: files.get(l.id) }));
}
