import { createClient } from "@/lib/supabase/server";

// Sol menyu üçün: depo/yanacaq bəndləri, profil (ad, rol, şəkil)
export async function fetchPanelChrome() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const uid = String(data?.claims.sub ?? "");
  const email = String(data?.claims.email ?? "");
  const [{ data: canManageTools }, { data: admin }, { data: employee }, { data: profile }] = await Promise.all([
    supabase.rpc("can_manage_tools"),
    supabase.rpc("is_admin"),
    supabase.from("employees").select("id, full_name, position, photo_url, has_car").eq("user_id", uid).maybeSingle(),
    supabase.from("profiles").select("full_name").eq("id", uid).maybeSingle(),
  ]);
  return { email, canManageTools, admin, employee, profile };
}
