import { createClient } from "@/lib/supabase/server";

// Server komponentində: giriş edilibmi (header "Daxil ol" / "Panelə keç" seçir)
export async function hasSession(): Promise<boolean> {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  return !!data?.claims;
}
