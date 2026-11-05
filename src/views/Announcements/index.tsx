"use client";

import { useEffect } from "react";
import { revalidate } from "@/lib/revalidate";
import { useData } from "@/lib/useData";
import { fetchAnnouncements, fetchAnnouncerState, watchAnnouncements } from "@/services/announcements/announcements";
import { ANNOUNCEMENTS_KEY, ANNOUNCER_KEY } from "./queries/keys";
import { AnnouncementForm } from "./components/AnnouncementForm";
import { AnnouncementList } from "./components/AnnouncementList";

// Elanlar: hamı oxuyur (yeni elan canlı gəlir); rəhbərlik kartı olan burada da göndərə bilər (admin-də də var)
export function AnnouncementsView() {
  const items = useData(ANNOUNCEMENTS_KEY, () => fetchAnnouncements());
  const who = useData(ANNOUNCER_KEY, () => fetchAnnouncerState());

  useEffect(() => watchAnnouncements(() => revalidate(ANNOUNCEMENTS_KEY)), []);

  if (!who?.canSend) return <AnnouncementList items={items} me={who?.me ?? null} />;
  return (
    <div className="grid grid-cols-[minmax(0,1fr)] items-start gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
      <AnnouncementForm />
      <AnnouncementList items={items} me={who.me} />
    </div>
  );
}
