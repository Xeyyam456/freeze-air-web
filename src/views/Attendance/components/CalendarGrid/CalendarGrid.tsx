import { Check } from "lucide-react";
import { presenceText } from "@/shared/utils/attendance/presenceText";
import type { CalendarGridProps } from "@/types/attendance";
import { CELL, LEGEND, WEEK } from "../../constants/calendar";

// Ayın təqvimi (bazar ertəsindən) + rəng izahı (< 385px sıxılır)
export function CalendarGrid({ days, lead }: CalendarGridProps) {
  return (
    <>
      <div className="grid grid-cols-7 gap-1.5 text-center">
        {WEEK.map((w) => <span key={w} className="muted pb-1 text-[11px] font-semibold">{w}</span>)}
        {Array.from({ length: lead }, (_, i) => <span key={`e${i}`} />)}
        {days
          ? days.map(({ day, status, presence }) => (
            <span key={day} title={presence ? `İşdə: ${presenceText(presence)}` : undefined}
              className={`flex aspect-square flex-col items-center justify-center rounded-lg text-sm font-bold ${CELL[status]}`}>
              {status === "present" ? <Check size={14} strokeWidth={3} /> : Number(day.slice(8))}
              {status === "present" && <span className="text-[10px] font-semibold leading-none opacity-90">{Number(day.slice(8))}</span>}
            </span>
          ))
          : Array.from({ length: 30 }, (_, i) => <span key={i} className="aspect-square rounded-lg bg-bg" />)}
      </div>
      <div className="mt-3 flex flex-nowrap justify-between gap-x-4 gap-y-1 max-[385px]:gap-x-1.5">
        {LEGEND.map((l) => (
          <span key={l.s} className="muted flex items-center gap-1.5 whitespace-nowrap text-xs max-[385px]:gap-1 max-[385px]:text-[10px]">
            <span className={`h-3 w-3 shrink-0 rounded max-[385px]:h-2 max-[385px]:w-2 ${CELL[l.s]}`} />{l.label}
          </span>
        ))}
      </div>
    </>
  );
}
