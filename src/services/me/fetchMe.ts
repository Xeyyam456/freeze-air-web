import { createClient } from "@/lib/supabase/client";
import type { DbClient } from "@/types/shared";

// Daxil olmuş istifadəçinin əməkdaş kartı: bir dəfə yüklənir, bütün komponentlər keşdən götürür (əvvəl hər biri ayrıca sorğulayırdı)
// supabase: serverdə prefetch üçün server klienti verilir (standart — brauzer klienti)
export async function fetchMe(supabase: DbClient = createClient()) {
  const { data: id } = await supabase.rpc("my_employee_id");
  if (!id) return { me: null };
  const { data: emp } = await supabase.from("employees").select("full_name").eq("id", id).maybeSingle();
  return { me: { id, name: emp?.full_name ?? "" } };
}
