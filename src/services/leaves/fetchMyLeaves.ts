import { createClient } from "@/lib/supabase/client";
import type { MyLeaveRow } from "@/types/leaves";

// Ustanın bütün icazə sorğuları (son 300), yeni tarix yuxarıda
export async function fetchMyLeaves(employeeId: number) {
  const { data } = await createClient().from("leave_requests")
    .select("id, employee_id, date_from, date_to, reason, status, created_at, decided_at")
    .eq("employee_id", employeeId).order("date_from", { ascending: false }).limit(300);
  return (data ?? []) as MyLeaveRow[];
}
