import { fetchAll } from "@/lib/fetchAll";
import { fetchGroupMap } from "@/lib/jobs";
import type { Kind } from "@/lib/kinds";
import { createClient } from "@/lib/supabase/server";
import { monthStartBaku } from "@/shared/utils/monthStartBaku";
import type { ClientListRaw } from "@/types/clients";

// Şirkətlərin/marketlərin siyahısı: filialların koordinatları + bu ayın işləri
export async function fetchClientList(kind: Kind): Promise<ClientListRaw> {
  const supabase = await createClient();
  const monthStart = monthStartBaku();
  const [{ data: clients }, works, groups] = await Promise.all([
    supabase
      .from("companies")
      .select("id, name, phone, address, contact_person, stores(lat, lng)")
      .eq("kind", kind)
      .order("name"),
    // Bu ayın işləri: ya birbaşa şirkətə (sabit məkan), ya da filialına/mağazasına yazılır
    // ayda 1000-dən çox iş ola bilər: hissələrlə (fetchAll)
    fetchAll((a, b) => supabase.from("work_logs").select("id, company_id, s:stores(company_id)").gte("work_date", monthStart).order("id").range(a, b)),
    fetchGroupMap(supabase, monthStart),
  ]);
  return { clients: clients ?? [], works, groups };
}
