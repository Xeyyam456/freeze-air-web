import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import { SUPABASE_URL, SUPABASE_KEY } from "@/lib/env";

// Cookie-siz klient: açıq məlumatdır (sayt məzmunu, qonaq müraciəti), istifadəçidən asılı deyil; "use cache" funksiyalarında işlənir
export function publicSiteClient() {
  return createClient<Database>(SUPABASE_URL, SUPABASE_KEY, { auth: { persistSession: false } });
}
