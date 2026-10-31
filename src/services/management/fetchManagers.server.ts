import { createClient } from "@/lib/supabase/server";

// Rəhbərlik (yalnız baxış): aktiv rəhbərlər
export async function fetchManagers() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("employees")
    .select("*")
    .eq("is_management", true)
    .eq("is_active", true)
    .order("full_name");
  return data ?? [];
}
