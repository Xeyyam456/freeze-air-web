import { monthStartBaku } from "@/shared/utils/monthStartBaku";
import { fetchAll } from "@/lib/fetchAll";
import { createClient } from "@/lib/supabase/server";
import { todayBaku } from "@/shared/utils/todayBaku";
import type { EmployeesRaw } from "@/types/employees";

// Ustalar səhifəsinin xam məlumatı (server): ustalar, bu ayın işləri, bu günün davamiyyəti və icazələri
export async function fetchEmployees(): Promise<EmployeesRaw> {
  const supabase = await createClient();
  const today = todayBaku();
  const [{ data: employees }, { data: myEmployeeId }, monthLogs, { data: attendance }, { data: leaves }] = await Promise.all([
    supabase.from("employees").select("*").eq("is_management", false).eq("is_active", true).order("full_name"),
    // Daxil olmuş istifadəçinin usta qeydi: öz kartı seçilir, işlərini yalnız özü əlavə edir
    supabase.rpc("my_employee_id"),
    // Bu ayın işləri: kartda "bu gün" və "bu ay" sayı; ayda 1000-dən çox iş ola bilər: hissələrlə (fetchAll)
    fetchAll((a, b) => supabase.from("work_logs").select("id, employee_id, work_date").gte("work_date", monthStartBaku()).order("id").range(a, b)),
    // Bu günün davamiyyəti (bir gündə bir neçə seans ola bilər) və təsdiqlənmiş icazələr
    supabase.from("attendance").select("employee_id, checked_in_at, checked_out_at").eq("day", today),
    supabase.from("leave_requests").select("employee_id").eq("status", "approved").lte("date_from", today).gte("date_to", today),
  ]);
  return { employees: employees ?? [], myEmployeeId: myEmployeeId ?? null, monthLogs, attendance: attendance ?? [], leaves: leaves ?? [] };
}
