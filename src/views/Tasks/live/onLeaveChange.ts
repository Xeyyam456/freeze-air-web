import type { RealtimePostgresChangesPayload } from "@supabase/supabase-js";
import { leaveRange } from "@/lib/attendance";
import { playNotify } from "@/lib/sound";
import { toast } from "@/lib/toast";
import type { Tables } from "@/types/database";
import type { LiveCtx } from "@/types/myTasks";

// İcazə sorğuma qərar verildi (0059): təsdiq və ya rədd tostu
export function onLeaveChange(payload: RealtimePostgresChangesPayload<Record<string, unknown>>, { me }: LiveCtx) {
  const l = payload.new as Tables<"leave_requests">;
  if (!me || l.employee_id !== me || l.status === (payload.old as Partial<Tables<"leave_requests">>).status) return;
  const range = leaveRange(l);
  if (l.status === "approved") toast.success(`İcazən təsdiqləndi: ${range}`, l.reason ?? undefined);
  else if (l.status === "rejected") toast.error(`İcazən rədd edildi: ${range}`, l.reason ?? undefined);
  playNotify();
}
