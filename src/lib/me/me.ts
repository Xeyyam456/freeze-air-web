import { createClient } from "@/lib/supabase/client";
import { useData } from "@/lib/useData";

// Daxil olmuş istifadəçinin əməkdaş kartı: bir dəfə yüklənir, bütün komponentlər keşdən götürür (əvvəl hər biri ayrıca sorğulayırdı)
async function fetchMe() {
  const supabase = createClient();
  const { data: id } = await supabase.rpc("my_employee_id");
  if (!id) return { me: null };
  const { data: emp } = await supabase.from("employees").select("full_name").eq("id", id).maybeSingle();
  return { me: { id, name: emp?.full_name ?? "" } };
}

// undefined = yüklənir, null = əməkdaş kartı yoxdur (məs. yalnız admin hesabı)
export function useMe(): { id: number; name: string } | null | undefined {
  const d = useData("me", fetchMe);
  return d === null ? undefined : d.me;
}
