import { createClient } from "@/lib/supabase/server";

// Bu ay iş yoxdursa: obyektin (özü + filialları) son işinin tarixi
export async function fetchLastWork(id: number): Promise<string | null> {
  const supabase = await createClient();
  const [ld, lu] = await Promise.all([
    supabase.from("work_logs").select("id, work_date").eq("company_id", id).order("work_date", { ascending: false }).limit(1),
    supabase.from("work_logs").select("id, work_date, s:stores!inner(company_id)").eq("s.company_id", id).order("work_date", { ascending: false }).limit(1),
  ]);
  return [ld.data?.[0]?.work_date, lu.data?.[0]?.work_date].filter(Boolean).sort().at(-1) ?? null;
}
