import type { RealtimePostgresChangesPayload } from "@supabase/supabase-js";
import { revalidate } from "@/lib/revalidate";
import { playNotify } from "@/lib/sound";
import { toast } from "@/lib/toast";
import { toolName } from "@/services/myTasks/names";
import type { Tables } from "@/types/database";
import type { LiveCtx } from "@/types/myTasks";

type Payload = RealtimePostgresChangesPayload<Record<string, unknown>>;

// Depo (0084): mənə alət verildi → "Aldım" xatırlatması. Hər dəyişiklikdə Alətlərim və Depo səhifələri yenilənir (useData → revalidate).
export async function onAssignmentChange(payload: Payload, { me }: LiveCtx) {
  revalidate();
  const a = payload.new as Partial<Tables<"tool_assignments">>;
  const o = payload.old as Partial<Tables<"tool_assignments">>;
  if (!me || a.employee_id !== me || a.returned_at || a.received_at) return;
  const given = payload.eventType === "INSERT" || (o.received_at && !a.received_at);
  if (!given) return;
  const name = await toolName(a.tool_id!);
  toast.success(`Sənə verildi: ${name ?? "alət"}`, "Alətlərim bölməsində «Aldım» ilə təsdiqlə");
  playNotify();
}

// Sorğuma cavab → tost; depo məsuluna yeni sənəd → tost
export function onDepotChange(payload: Payload, { me, keeper }: LiveCtx) {
  revalidate();
  const r = payload.new as Tables<"depot_requests">;
  const o = payload.old as Partial<Tables<"depot_requests">>;
  if (payload.eventType === "INSERT" && keeper && r.employee_id !== me) {
    toast.success(`Depo: ${r.created_by_name ?? ""}`, `${r.tool_name} · ${r.type === "return" ? "qaytarır" : r.type === "request" ? "istəyir" : "təsdiq gözləyir"}`);
    playNotify();
    return;
  }
  if (payload.eventType !== "UPDATE" || !me || r.employee_id !== me || r.status === o.status || !r.decided_by) return;
  const what = r.type === "return" ? "Qaytarman" : r.type === "request" ? "İstəyin" : "Sənəd";
  if (r.status === "approved") toast.success(`${what} qəbul edildi: ${r.tool_name}`, r.decided_by_name ?? undefined);
  else if (r.status === "rejected") toast.error(`${what} rədd edildi: ${r.tool_name}`, r.decision_note ?? r.decided_by_name ?? undefined);
  playNotify();
}
