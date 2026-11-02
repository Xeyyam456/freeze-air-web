"use client";

import { Megaphone } from "lucide-react";
import { Card } from "@/shared/components/Card";
import type { AnnouncementListProps } from "@/types/announcements";
import { groupByDay } from "../../utils/groupByDay";
import { AnnouncementRow } from "../AnnouncementRow";

// Rəhbərliyin elanları günlərə görə (yenidən köhnəyə): gün başlığı, altında elanlar; son 24 saat "Yeni"
export function AnnouncementList({ items, me }: AnnouncementListProps) {
  if (!items) return <Card className="muted py-10 text-center text-sm">Yüklənir...</Card>;
  if (!items.length) {
    return (
      <Card className="flex flex-col items-center gap-2 py-12 text-center">
        <span className="grid h-11 w-11 place-items-center rounded-full bg-primary-soft text-primary"><Megaphone size={20} /></span>
        <p className="font-semibold">Hələ elan yoxdur</p>
        <p className="muted text-sm">Rəhbərlik elan göndərəndə burada və telefonunda bildiriş kimi görünəcək.</p>
      </Card>
    );
  }
  return (
    <Card className="overflow-hidden !p-0">
      {groupByDay(items).map((g) => (
        <section key={g.label}>
          <h2 className="muted border-b border-line bg-bg/70 px-4 py-1.5 text-xs font-semibold max-sm:px-3">{g.label}</h2>
          <ul className="divide-y divide-line">
            {g.items.map((a) => <AnnouncementRow key={a.id} a={a} mine={a.created_by === me} />)}
          </ul>
        </section>
      ))}
    </Card>
  );
}
