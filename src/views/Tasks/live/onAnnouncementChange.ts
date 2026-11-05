import type { RealtimePostgresChangesPayload } from "@supabase/supabase-js";
import { ELANLAR_PATH, markAnnouncementsRead, refreshUnreadAnnouncements } from "@/lib/announcements-live";
import { revalidate } from "@/lib/revalidate";
import { playNotify } from "@/lib/sound";
import { toast } from "@/lib/toast";
import type { Tables } from "@/types/database";
import type { LiveCtx } from "@/types/myTasks";
import { ANNOUNCEMENTS_KEY } from "@/views/Announcements/queries/keys";

// Elan yazıldı/silindi: siyahı yenilənir; başqasının yeni elanı → tost + səs (push gəlməsə də görünsün).
// Elanlar səhifəsi açıqdırsa oxunmuş sayılır, yoxsa menyudakı nişan artır.
export function onAnnouncementChange(payload: RealtimePostgresChangesPayload<Record<string, unknown>>, { uid }: LiveCtx) {
  revalidate(ANNOUNCEMENTS_KEY);
  const onPage = window.location.pathname.startsWith(ELANLAR_PATH);
  if (payload.eventType === "INSERT") {
    const a = payload.new as Tables<"announcements">;
    if (a.created_by === uid) return;
    if (onPage) {
      void markAnnouncementsRead();
      return;
    }
    toast.success(`Yeni elan: ${a.title}`, a.created_by_name ?? undefined);
    playNotify();
  }
  if (!onPage) void refreshUnreadAnnouncements();
}
