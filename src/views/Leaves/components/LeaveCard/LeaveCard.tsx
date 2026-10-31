"use client";

import { Trash2 } from "lucide-react";
import { leaveRange } from "@/shared/utils/attendance/leaveRange";
import { leaveWorkdays } from "@/shared/utils/attendance/leaveWorkdays";
import type { LeaveCardProps } from "@/types/leaves";
import { stamp } from "../../utils/stamp";
import { statusOf } from "../../utils/statusOf";
import { Button } from "@/shared/components/Button";

// Bir sorğunun kartı: tarix bloku, gün sayı, səbəb, vəziyyət; aktivlərdə "Ehtiyac qalmadı" / "Geri götür"
export function LeaveCard({ leave: l, today, onGiveUp, onCancel }: LeaveCardProps) {
  const st = statusOf(l.status);
  const ongoing = l.status === "approved" && l.date_from <= today && today <= l.date_to;

  return (
    <li className="card flex min-w-0 items-stretch gap-4 overflow-hidden !p-0">
      <span className={`w-1.5 shrink-0 ${st.bar}`} />
      <div className="flex min-w-0 flex-1 flex-wrap items-center gap-x-4 gap-y-2 py-3 pr-4 max-sm:items-start">
        <div className="min-w-0 flex-[1_1_220px] max-sm:flex-1">
          <p className="flex flex-wrap items-center gap-x-2 text-[15px]">
            <span className="font-bold">{leaveRange(l)}</span>
            <span className="muted whitespace-nowrap text-sm"><span className="max-sm:hidden">· </span>{leaveWorkdays(l)} iş günü</span>
            {ongoing && <span className="rounded-full bg-[#fff6e5] px-2 py-0.5 text-[11px] font-semibold text-amber-700">İndi icazədəsən</span>}
          </p>
          <p className="muted line-clamp-2 text-sm">{l.reason || "Səbəb yazılmayıb"}</p>
          <p className="muted text-[11px] max-[360px]:text-[10px] max-sm:[&>span]:block max-sm:[&>span]:whitespace-nowrap">
            <span>Göndərilib: {stamp(l.created_at)}</span>{l.decided_at && <span><span className="max-sm:hidden"> · </span>cavab: {stamp(l.decided_at)}</span>}
          </p>
        </div>
        <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${st.cls}`}>{st.text}</span>
        {onGiveUp && (
          <Button type="button" onClick={onGiveUp} variant="soft" size="sm" className="shrink-0 max-sm:w-full max-sm:!h-7 max-sm:!text-[13px]" title="İcazəni ləğv et, işə gəl">Ehtiyac qalmadı</Button>
        )}
        {onCancel && (
          <Button type="button" onClick={onCancel} variant="soft" size="sm" className="shrink-0 text-danger max-sm:w-full max-sm:!h-7 max-sm:!text-[13px]" title="Sorğunu geri götür">
            <Trash2 size={14} /> Geri götür
          </Button>
        )}
      </div>
    </li>
  );
}
