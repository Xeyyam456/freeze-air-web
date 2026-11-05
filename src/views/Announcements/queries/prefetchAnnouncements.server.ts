import { fetchAnnouncements, fetchAnnouncerState } from "@/services/announcements/announcements";
import type { PrefetchEntry } from "@/types/panel";
import type { DbClient } from "@/types/shared";
import { ANNOUNCEMENTS_KEY, ANNOUNCER_KEY } from "./keys";

// Elanlar: siyahı + göndərənin vəziyyəti (form rəhbərliyə görünür) serverdə hazır; açarlar AnnouncementsView ilə eynidir
export async function prefetchAnnouncements(db: DbClient): Promise<PrefetchEntry[]> {
  const [items, who] = await Promise.all([fetchAnnouncements(db), fetchAnnouncerState(db)]);
  return [
    { key: [ANNOUNCEMENTS_KEY], data: items },
    { key: [ANNOUNCER_KEY], data: who },
  ];
}
