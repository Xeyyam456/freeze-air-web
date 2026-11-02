import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

// Saytdan gələn müraciəti bazaya yazır. Qonaq üçün cookie-siz klient; baza yalnız əlavə etməyə icazə verir (oxumaq yalnız admin).
export async function insertContactRequest(row: { name: string; phone: string; email: string | null; message: string | null }) {
  const supabase = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    { auth: { persistSession: false } },
  );
  const { error } = await supabase.from("contact_requests").insert(row);
  return error;
}
