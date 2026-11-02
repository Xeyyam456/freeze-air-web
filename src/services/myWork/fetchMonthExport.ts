import { createClient } from "@/lib/supabase/client";

// Ustanın seçilmiş ay üzrə iş qeydləri + adı (Excel ixracı üçün)
export async function fetchMonthExport(employeeId: number, from: string, to: string) {
  const supabase = createClient();
  const [{ data: logs, error }, { data: emp }] = await Promise.all([
    supabase.from("work_logs")
      .select("id, work_date, created_at, description, place_text, stores(name, code, companies(name)), companies(name)")
      .eq("employee_id", employeeId).gte("work_date", from).lte("work_date", to)
      .order("work_date").order("created_at"),
    supabase.from("employees").select("full_name").eq("id", employeeId).maybeSingle(),
  ]);
  return { logs: logs ?? [], name: emp?.full_name ?? "Usta", error };
}
