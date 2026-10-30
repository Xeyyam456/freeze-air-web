import { LogIn, LogOut } from "lucide-react";
import { durationText } from "@/shared/utils/attendance/durationText";
import { presenceText } from "@/shared/utils/attendance/presenceText";
import { sessionNo } from "@/shared/utils/attendance/sessionNo";
import { timeBaku } from "@/shared/utils/timeBaku";
import type { HoursRowProps } from "@/types/attendance";
import { fullDate, weekdayName } from "../../utils/dates";

// Bir gün: tarix + həftənin günü · müddət; hər seans ayrıca sətirdə (işi bitirib yenidən işə çıxıbsa bir neçə gəlmə – getmə)
export function HoursRow({ day, presence: p }: HoursRowProps) {
  const dur = durationText(p);

  return (
    <li className="flex items-center gap-3 px-3 py-2 max-[400px]:gap-2 max-[400px]:px-2.5">
      <span className="min-w-0 flex-1">
        <span className="block whitespace-nowrap text-sm font-bold tabular-nums max-[400px]:text-xs">{fullDate(day)}</span>
        <span className="muted block whitespace-nowrap text-[11px] max-[400px]:text-[10px] max-[400px]:leading-tight">{weekdayName(day)}{dur && ` · ${dur}`}</span>
      </span>
      <span className="flex shrink-0 flex-col items-end gap-1" title={presenceText(p)}>
        {p.sessions.map((x, i) => (
          <span key={x.in} className="flex items-center gap-1.5 max-[400px]:gap-1">
            {p.sessions.length > 1 && <span className="muted w-5 text-right text-xs font-bold tabular-nums max-[400px]:w-3.5 max-[400px]:text-[10px]">{sessionNo(i, p.sessions.length).trim()}</span>}
            <span className="flex items-center gap-1 rounded-lg bg-ok-soft px-2 py-1 text-xs font-bold tabular-nums text-ok max-[400px]:gap-0.5 max-[400px]:px-1.5 max-[400px]:py-0.5 max-[400px]:text-[11px]" title="Gəlmə saatı">
              <LogIn size={12} className="max-[400px]:h-2.5 max-[400px]:w-2.5" /> {timeBaku(x.in)}
            </span>
            {x.out ? (
              <span className="flex items-center gap-1 rounded-lg bg-bg px-2 py-1 text-xs font-bold tabular-nums max-[400px]:gap-0.5 max-[400px]:px-1.5 max-[400px]:py-0.5 max-[400px]:text-[11px]" title="Getmə saatı">
                <LogOut size={12} className="max-[400px]:h-2.5 max-[400px]:w-2.5" /> {timeBaku(x.out)}
              </span>
            ) : (
              <span className="rounded-lg bg-primary-soft px-2 py-1 text-xs font-semibold text-primary">hələ işdədir</span>
            )}
          </span>
        ))}
      </span>
    </li>
  );
}
