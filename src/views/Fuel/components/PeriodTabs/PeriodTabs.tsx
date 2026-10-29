import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import type { PeriodTabsProps } from "@/types/myFuel";
import { PERIOD_LABEL } from "../../shared/period";

// Dövr seçimi (Gün | Həftə | Ay) və ‹ tarix ›; gələcəyə keçmir
export function PeriodTabs({ period, label, atEnd, onPeriod, onShift }: PeriodTabsProps) {
  return (
    <div className="ml-auto flex flex-wrap items-center gap-2 max-lg:ml-0 max-lg:w-full max-lg:justify-between">
      <div className="flex gap-1 rounded-xl bg-white/10 p-1 max-sm:w-full max-sm:[&>button]:flex-1" role="tablist" aria-label="Dövr">
        {(["day", "week", "month"] as const).map((p) => (
          <button key={p} type="button" role="tab" aria-selected={period === p} onClick={() => onPeriod(p)}
            className={`rounded-lg px-3.5 py-1.5 text-sm font-semibold transition-colors max-sm:py-1 ${period === p ? "bg-white text-[#0c1b36]" : "text-white/70 hover:text-white"}`}>
            {PERIOD_LABEL[p]}
          </button>
        ))}
      </div>
      <div className="flex items-center gap-1 rounded-xl bg-white/10 px-1 py-1 max-sm:w-full max-sm:py-0.5 max-sm:justify-between sm:max-lg:min-w-60 sm:max-lg:justify-between">
        <button type="button" onClick={() => onShift(-1)} className="grid h-7 w-7 place-items-center rounded-lg text-white/70 hover:bg-white/10 hover:text-white" aria-label="Əvvəlki"><ChevronLeft size={16} /></button>
        <span className="flex min-w-32 items-center justify-center gap-1.5 text-sm font-semibold"><CalendarDays size={14} className="text-frost" /> {label}</span>
        <button type="button" onClick={() => onShift(1)} disabled={atEnd} className="grid h-7 w-7 place-items-center rounded-lg text-white/70 hover:bg-white/10 hover:text-white disabled:opacity-30" aria-label="Sonrakı"><ChevronRight size={16} /></button>
      </div>
    </div>
  );
}
