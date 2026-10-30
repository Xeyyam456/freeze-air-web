import { createClient } from "@/lib/supabase/client";
import type { Leave } from "@/types/attendance";

// "İcazə istə" pəncərəsində son 6 sorğu
export async function fetchRecentLeaves(employeeId: number) {
  const { data } = await createClient().from("leave_requests").select("id, employee_id, date_from, date_to, reason, status, created_at")
    .eq("employee_id", employeeId).order("date_from", { ascending: false }).limit(6);
  return (data ?? []) as Leave[];
}
