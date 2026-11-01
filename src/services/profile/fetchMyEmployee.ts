import { createClient } from "@/lib/supabase/client";

// Giriş etmiş ustanın əməkdaş kartı (id və ad); bağlı kart yoxdursa null
export async function fetchMyEmployee(): Promise<{ id: number; name: string } | null> {
  const supabase = createClient();
  const { data: id } = await supabase.rpc("my_employee_id");
  if (!id) return null;
  const { data: emp } = await supabase.from("employees").select("full_name").eq("id", id).maybeSingle();
  return { id, name: emp?.full_name ?? "" };
}
