import { fetchFileCounts, fetchGroupMap, mergeGroupLogs } from "@/lib/jobs";
import { createClient } from "@/lib/supabase/client";
import type { HistoryRow, HistoryTarget } from "@/types/myWork";

// Neçə iş göstərilir (ən yenilər); obyektdə bundan çox iş olanda altda qeyd çıxır
export const HISTORY_LIMIT = 150;
const SELECT = "id, work_date, created_at, description, employees(full_name, photo_url), stores(code, name)";

// Qrup işi bir sətir ("Xəyyam + Fərhad"), fayl nişanları qrup üzrə (video/şəkil istənilən üzvün qeydinə yüklənə bilər)
export async function fetchPlaceHistory(t: HistoryTarget): Promise<HistoryRow[]> {
  const supabase = createClient();
  const rows = await fetchRows(supabase, t);
  const oldest = rows.at(-1)?.work_date;
  const groups = oldest ? await fetchGroupMap(supabase, oldest) : new Map<number, string>();
  const merged = mergeGroupLogs(rows, groups);
  const files = await fetchFileCounts(supabase, merged.map((r) => r.id));
  return merged.map((r) => ({ ...r, files: files.get(r.id) }));
}

async function fetchRows(supabase: ReturnType<typeof createClient>, t: HistoryTarget): Promise<HistoryRow[]> {
  const newest = <Q extends { order: (c: string, o: { ascending: boolean }) => Q }>(q: Q) =>
    q.order("work_date", { ascending: false }).order("created_at", { ascending: false });
  if (t.storeId) {
    const { data } = await newest(supabase.from("work_logs").select(SELECT).eq("store_id", t.storeId)).limit(HISTORY_LIMIT);
    return (data ?? []) as HistoryRow[];
  }
  // Şirkət: sabit məkanın özündə görülənlər + filiallarında görülənlər (iki sorğu, sonra tarixə görə birləşir)
  const [own, branches] = await Promise.all([
    newest(supabase.from("work_logs").select(SELECT).eq("company_id", t.companyId!)).limit(HISTORY_LIMIT),
    newest(supabase.from("work_logs").select(`${SELECT}, s:stores!inner(company_id)`).eq("s.company_id", t.companyId!)).limit(HISTORY_LIMIT),
  ]);
  return [...((own.data ?? []) as HistoryRow[]), ...((branches.data ?? []) as HistoryRow[])]
    .sort((a, b) => b.work_date.localeCompare(a.work_date) || b.created_at.localeCompare(a.created_at))
    .slice(0, HISTORY_LIMIT);
}
