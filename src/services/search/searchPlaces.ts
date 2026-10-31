import { createClient } from "@/lib/supabase/client";
import type { Found, FoundStore } from "@/types/panel";

// Ctrl+K: şirkət / market və mağaza axtarışı.
// Söz-söz: "arz 01" → hər söz ad, kod və ya ünvanda olmalıdır (ARZ-001 tapılır)
export async function searchPlaces(q: string): Promise<Found> {
  const supabase = createClient();
  const words = q.replace(/[%_,()*]/g, " ").split(/\s+/).filter(Boolean);
  let companyQuery = supabase.from("companies").select("id, name, kind");
  let storeQuery = supabase.from("stores").select("id, code, name, address, company_id, companies(name, kind)");
  for (const w of words) {
    companyQuery = companyQuery.ilike("name", `%${w}%`);
    storeQuery = storeQuery.or(`name.ilike.%${w}%,code.ilike.%${w}%,address.ilike.%${w}%`);
  }
  const [{ data: companies }, { data: stores }] = await Promise.all([
    companyQuery.order("name").limit(5),
    storeQuery.order("code").limit(8),
  ]);
  return { companies: companies ?? [], stores: (stores ?? []) as FoundStore[] };
}
