import { createClient } from "@/lib/supabase/client";
import type { AttendanceRange, AttRow, Leave } from "@/types/attendance";
import type { DbClient } from "@/types/shared";

// Aralıq üçün gəlmələr, icazələr və "işdə olmayıb" qeydləri (employeeId verilsə yalnız o usta)
// supabase: serverdə prefetch üçün server klienti verilir (standart — brauzer klienti)
export async function fetchRange(from: string, to: string, employeeId?: number, supabase: DbClient = createClient()): Promise<AttendanceRange> {
  let att = supabase.from("attendance").select("employee_id, day, checked_in_at, checked_out_at").gte("day", from).lte("day", to);
  let lv = supabase.from("leave_requests").select("id, employee_id, date_from, date_to, reason, status, created_at").lte("date_from", to).gte("date_to", from);
  let ab = supabase.from("attendance_absences").select("employee_id, day").gte("day", from).lte("day", to);
  if (employeeId) {
    att = att.eq("employee_id", employeeId);
    lv = lv.eq("employee_id", employeeId);
    ab = ab.eq("employee_id", employeeId);
  }
  const [a, l, x] = await Promise.all([att.then((r) => (r.data ?? []) as AttRow[]), lv.then((r) => (r.data ?? []) as Leave[]), ab.then((r) => r.data ?? [])]);
  return { att: a, leaves: l, absences: x };
}
