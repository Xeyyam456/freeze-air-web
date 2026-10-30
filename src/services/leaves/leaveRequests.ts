import { createClient } from "@/lib/supabase/client";

// Yeni icazə sorğusu (admin təsdiqləyir)
export async function submitLeave(employeeId: number, from: string, to: string, reason: string) {
  const { error } = await createClient().from("leave_requests").insert({ employee_id: employeeId, date_from: from, date_to: to, reason });
  return error;
}

// Təsdiqlənmiş icazəyə ehtiyac qalmadı: ləğv (başlayıbsa keçmiş günlər icazəli qalır, bazada leave_cancel)
export async function giveUpLeave(id: number) {
  const { error } = await createClient().rpc("leave_cancel", { p_id: id });
  return error;
}

// Gözləyən sorğunu geri götür
export async function cancelLeave(id: number) {
  const { error } = await createClient().from("leave_requests").delete().eq("id", id);
  return error;
}
