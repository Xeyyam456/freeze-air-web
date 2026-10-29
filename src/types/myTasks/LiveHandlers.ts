import type { RealtimePostgresChangesPayload } from "@supabase/supabase-js";
import type { LiveCtx } from "./LiveCtx";

type On = (payload: RealtimePostgresChangesPayload<Record<string, unknown>>, ctx: LiveCtx) => void;

// Usta panelinin Realtime hadisələri: tapşırıqlar, icazələr, alət təhvili, depo sənədləri; ready: kanal açılmazdan əvvəl
export type LiveHandlers = { ready: (ctx: LiveCtx) => void; tasks: On; leaves: On; assignments: On; depot: On };
