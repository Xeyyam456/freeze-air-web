"use client";

import { Trash2 } from "lucide-react";
import { leaveRange } from "@/shared/utils/attendance/leaveRange";
import { leaveWorkdays } from "@/shared/utils/attendance/leaveWorkdays";
import type { RecentRowProps } from "@/types/leaves";
import { statusOf } from "../../utils/statusOf";
import { Button } from "@/shared/components/Button";

// Son sorğu sətri: tarix, gün sayı, səbəb, vəziyyət; təsdiqlənmişdə "Ehtiyac qalmadı", gözləyəndə geri götürmək
export function RecentRow({ leave: l, today, onGiveUp, onCancel }: RecentRowProps) {
  const st = statusOf(l.status);

  return (
    <li className="flex items-center gap-3 px-3 py-2 text-sm">
      <span className="min-w-0 flex-1">
        <span className="font-semibold">{leaveRange(l)}</span>
        <span className="muted"> · {leaveWorkdays(l)} gün</span>
        {l.reason && <span className="muted block truncate text-xs">{l.reason}</span>}
      </span>
      <span className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold ${st.cls}`}>{st.text}</span>
      {l.status === "approved" && l.date_to >= today && (
        <Button type="button" onClick={() => onGiveUp(l.id)} variant="soft" size="sm" className="!h-7 shrink-0 !px-2 text-xs" title="İcazəni ləğv et, işə gəl">
          Ehtiyac qalmadı
        </Button>
      )}
      {l.status === "pending" && (
        <button type="button" onClick={() => onCancel(l.id)} className="icon-btn icon-btn-danger !h-7 !w-7" title="Sorğunu geri götür" aria-label="Sorğunu geri götür">
          <Trash2 size={14} />
        </button>
      )}
    </li>
  );
}
