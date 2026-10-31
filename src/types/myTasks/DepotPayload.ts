import type { RealtimePostgresChangesPayload } from "@supabase/supabase-js";

export type DepotPayload = RealtimePostgresChangesPayload<Record<string, unknown>>;
