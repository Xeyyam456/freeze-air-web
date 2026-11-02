"use client";

import { Megaphone, Trash2 } from "lucide-react";
import { ConfirmButton } from "@/components/ConfirmButton";
import { revalidate } from "@/lib/revalidate";
import { deleteAnnouncement } from "@/services/announcements/announcements";
import { Card } from "@/shared/components/Card";
import type { AnnouncementListProps } from "@/types/announcements";
import { whenText } from "../../utils/whenText";

// Rəhbərliyin elanları (yenidən köhnəyə); öz elanını müəllif silə bilər
export function AnnouncementList({ items, me }: AnnouncementListProps) {
  if (!items) return <Card className="muted py-10 text-center text-sm">Yüklənir...</Card>;
  if (!items.length) return <Card className="muted py-10 text-center text-sm">Hələ elan yoxdur</Card>;
  return (
    <Card as="ul" className="divide-y divide-line !p-0">
      {items.map((a) => (
        <li key={a.id} className="flex items-start gap-3 px-4 py-3">
          <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-full bg-primary-soft text-primary"><Megaphone size={15} /></span>
          <div className="min-w-0 flex-1">
            <p className="font-semibold">{a.title}</p>
            {a.body && <p className="muted mt-0.5 whitespace-pre-line text-sm">{a.body}</p>}
            <p className="muted mt-1 text-xs">{a.created_by_name ?? "Rəhbərlik"} · {whenText(a.created_at)}</p>
          </div>
          {a.created_by === me && (
            <ConfirmButton icon danger title="Elanı sil" question="Elan siyahıdan silinəcək; artıq göndərilmiş bildiriş geri qayıtmır."
              onConfirm={async () => { await deleteAnnouncement(a.id); revalidate("announcements"); }}>
              <Trash2 size={16} />
            </ConfirmButton>
          )}
        </li>
      ))}
    </Card>
  );
}
