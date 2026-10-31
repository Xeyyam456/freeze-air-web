import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

// Cookie-siz klient: açıq məlumatdır (sayt məzmunu), istifadəçidən asılı deyil; "use cache" funksiyalarında işlənir
export function publicSiteClient() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    { auth: { persistSession: false } },
  );
}
