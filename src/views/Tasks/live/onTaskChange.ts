import type { RealtimePostgresChangesPayload } from "@supabase/supabase-js";
import { isSoundReady, playNotify } from "@/lib/sound";
import { refreshMyOpenTasks, TASKS_CHANGED } from "@/lib/tasks-live";
import { toast } from "@/lib/toast";
import { placeName } from "@/services/myTasks/names";
import type { Tables } from "@/types/database";
import type { LiveCtx } from "@/types/myTasks";
import { markTitle } from "./tabTitle";

// Tapşırıqlar (0056): admin ustaya tapşırıq verəndə həmin ustaya tost + qısa səs + tab başlığı, geri alanda (0057) xəbərdarlıq;
// hər dəyişiklikdə Tapşırıqlar siyahısı, "Mənim bugünüm" və menyudakı nişan yenilənir
export async function onTaskChange(payload: RealtimePostgresChangesPayload<Record<string, unknown>>, { me }: LiveCtx) {
  window.dispatchEvent(new Event(TASKS_CHANGED));
  void refreshMyOpenTasks(me);
  const t = payload.new as Tables<"tasks">;
  if (!me || t.employee_id !== me) return;
  // Admin öz tapşırığımı geri aldı (başqa ustaya verə bilər): xəbərdarlıq, səssiz
  if (payload.eventType === "UPDATE" && t.cancelled_at && !(payload.old as Partial<Tables<"tasks">>).cancelled_at) {
    toast.error(`Tapşırıq geri alındı: ${(await placeName(t)) || t.reason}`, t.reason);
    return;
  }
  if (payload.eventType !== "INSERT") return;
  const place = await placeName(t);
  const silent = !isSoundReady();
  toast.success(`Yeni tapşırıq: ${place || t.reason}`, silent ? `${t.reason} · səs üçün səhifədə bir dəfə klik et` : t.reason);
  playNotify();
  markTitle();
}
