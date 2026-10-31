import { fetchAll } from "@/lib/fetchAll";
import { fetchGroupMap } from "@/lib/jobs";
import { createClient } from "@/lib/supabase/server";
import { monthStartBaku } from "@/shared/utils/monthStartBaku";
import type { ClientDetailRaw } from "@/types/clients";

// Şirkət/market, filialları və bu ayın işləri.
// İşlər ya birbaşa şirkətə (sabit məkan), ya da filialına/mağazasına yazılır: ikisi ayrıca yüklənir
export async function fetchClientDetail(id: number): Promise<ClientDetailRaw> {
  const supabase = await createClient();
  const monthStart = monthStartBaku();
  const direct = () => supabase.from("work_logs").select("id, work_date").eq("company_id", id);
  const viaUnit = () => supabase.from("work_logs").select("id, work_date, s:stores!inner(company_id)").eq("s.company_id", id);
  const [{ data: client }, { data: units }, d, u, groups] = await Promise.all([
    supabase.from("companies").select("*").eq("id", id).maybeSingle(),
    supabase.from("stores").select("*").eq("company_id", id).order("code"),
    // ayda 1000-dən çox iş ola bilər (böyük şəbəkə): hissələrlə (fetchAll)
    fetchAll((a, b) => direct().gte("work_date", monthStart).order("id").range(a, b)),
    fetchAll((a, b) => viaUnit().gte("work_date", monthStart).order("id").range(a, b)),
    fetchGroupMap(supabase, monthStart),
  ]);
  return { client, units: units ?? [], logs: [...d, ...u], groups };
}
