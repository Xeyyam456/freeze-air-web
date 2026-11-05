import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

// Tipli Supabase klienti: brauzer (lib/supabase/client) və server (lib/supabase/server) klientləri eyni tipdədir.
// Servislər onu parametr kimi qəbul edir ki, eyni sorğu serverdə əvvəlcədən (prefetch) də işləsin.
export type DbClient = SupabaseClient<Database>;
