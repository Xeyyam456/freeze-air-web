import { useSyncExternalStore } from "react";
import { fetchUnreadAnnouncements, markAnnouncementsSeen } from "@/services/announcements/announcements";

// Menyudakı "Elanlar" nişanı: oxunmamış elanların sayı (0105). Bildiriş gəlməsə də usta menyuda görür.
// Panel kanalı (views/Tasks/live/onAnnouncementChange) yeni/silinən elanda yeniləyir; Elanlar səhifəsi sıfırlayır.
export const ELANLAR_PATH = "/elanlar";
let unread = 0;
const listeners = new Set<() => void>();
const set = (n: number) => {
  if (n === unread) return;
  unread = n;
  listeners.forEach((l) => l());
};

export async function refreshUnreadAnnouncements() {
  set(await fetchUnreadAnnouncements().catch(() => unread));
}

// Elanlar səhifəsi açıqdır (və ya orada yeni elan gəldi): hamısı oxundu
export async function markAnnouncementsRead() {
  set(0);
  await markAnnouncementsSeen().catch(() => undefined);
}

export function useUnreadAnnouncements() {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    () => unread,
    () => 0,
  );
}
