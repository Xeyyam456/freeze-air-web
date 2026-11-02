import { IconButton } from "@/shared/components/IconButton";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DatePicker } from "@/shared/components/DatePicker";
import type { DayNavProps } from "@/types/myWork";
import { dayIso } from "../../hooks/useWorkTab";

const chip = (active: boolean) =>
  `h-9 rounded-lg px-3 text-[13px] font-semibold transition-colors ${active ? "bg-primary text-white" : "bg-bg text-ink hover:bg-primary-soft"}`;

// Gün seçimi: Bu gün, Dünən, ‹ təqvim › ("Yeni iş" düyməsi 2026-11-02 silindi: iş tapşırıq "görüldü" ilə yazılır)
export function DayNav({ day, today, yesterday, onDay }: DayNavProps) {
  return (
    <div className="flex shrink-0 items-center gap-2">
      <button type="button" onClick={() => onDay(today)} className={chip(day === today)}>Bu gün</button>
      <button type="button" onClick={() => onDay(yesterday)} className={chip(day === yesterday)}>Dünən</button>
      <div className="flex flex-1 items-center gap-1">
        <IconButton onClick={() => onDay(dayIso(-1, day))} className="!h-9 !w-9" aria-label="Əvvəlki gün">
          <ChevronLeft size={18} />
        </IconButton>
        <div className="min-w-0 flex-1">
          <DatePicker value={day} onChange={onDay} max={today} small />
        </div>
        <IconButton onClick={() => onDay(dayIso(1, day))} disabled={day >= today}
          className="!h-9 !w-9 disabled:opacity-30" aria-label="Növbəti gün">
          <ChevronRight size={18} />
        </IconButton>
      </div>
    </div>
  );
}
