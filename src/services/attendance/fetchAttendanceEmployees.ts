import { createClient } from "@/lib/supabase/client";
import type { AttendanceEmployee } from "@/types/attendance";
import type { DbClient } from "@/types/shared";

// Davamiyyət cədvəlinin ustaları (aktiv, rəhbərlik yox). supabase: serverdə prefetch üçün (standart — brauzer)
export async function fetchAttendanceEmployees(supabase: DbClient = createClient()) {
  const { data } = await supabase.from("employees").select("id, full_name, photo_url, specialty").eq("is_management", false).eq("is_active", true).order("full_name");
  return (data ?? []) as AttendanceEmployee[];
}
