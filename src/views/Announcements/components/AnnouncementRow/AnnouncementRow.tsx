"use client";

import { Megaphone, Trash2 } from "lucide-react";
import { ConfirmButton } from "@/components/ConfirmButton";
import { revalidate } from "@/lib/revalidate";
import { deleteAnnouncement } from "@/services/announcements/announcements";
import type { AnnouncementRowProps } from "@/types/announcements";
import { isFresh, timeText } from "../../utils/whenText";

const NEW = "inline-block rounded-full bg-primary-soft px-2 py-px text-[11px] font-bold text-primary";

// Bir elan: ikon (yenisi dolu göy), başlıq + "Yeni", mətn (oxunaqlı en), müəllif · saat; öz elanını müəllif silir
export function AnnouncementRow({ a, mine }: AnnouncementRowProps) {
  const fresh = isFresh(a.created_at);
  return (
    <li className="flex items-start gap-3 px-4 py-3.5 max-sm:gap-2.5 max-sm:px-3 max-sm:py-3">
      <span className={`mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-full max-sm:h-8 max-sm:w-8 ${fresh ? "bg-primary text-white" : "bg-primary-soft text-primary"}`}>
        <Megaphone size={16} />
      </span>
      <div className="min-w-0 max-w-[72ch] flex-1">
        <p className="text-[15px] font-semibold leading-snug max-sm:text-sm">
          {a.title}
          {fresh && <span className={`${NEW} ml-2 align-[2px] max-sm:hidden`}>Yeni</span>}
        </p>
        {a.body && <p className="muted mt-1 whitespace-pre-line break-words text-sm leading-relaxed max-sm:text-[13px]">{a.body}</p>}
        {/* Mobildə "Yeni" başlığın sonunda tək sətrə düşməsin deyə müəllif sətrindədir */}
        <p className="muted mt-1.5 flex items-center gap-1.5 text-xs">
          {fresh && <span className={`${NEW} sm:hidden`}>Yeni</span>}
          {a.created_by_name ?? "Rəhbərlik"} · {timeText(a.created_at)}
        </p>
      </div>
      {mine && (
        <ConfirmButton icon danger title="Elanı sil" question="Elan siyahıdan silinəcək; artıq göndərilmiş bildiriş geri qayıtmır."
          onConfirm={async () => { await deleteAnnouncement(a.id); revalidate("announcements"); }}>
          <Trash2 size={16} />
        </ConfirmButton>
      )}
    </li>
  );
}
