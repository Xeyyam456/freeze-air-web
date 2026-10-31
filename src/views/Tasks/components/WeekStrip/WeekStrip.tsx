import { ChevronLeft, ChevronRight } from "lucide-react";
import { formatDateAz } from "@/shared/utils/formatDateAz";
import type { WeekStripProps } from "@/types/myTasks";
import { shift, WEEKDAYS, weekRange } from "../../utils/days";
import { Button } from "@/shared/components/Button";
import { Card } from "@/shared/components/Card";

// Həftə zolağı: 7 gün, hər gündə tapşırıq sayı; mənim tapşırığım olan gündə nöqtə
export function WeekStrip({ day, today, from, rows, me, onDay }: WeekStripProps) {
  const days = Array.from({ length: 7 }, (_, i) => shift(from, i));
  // Həftədə heç bir gündə tapşırıq yoxdursa say xanası yer tutmur (seçilmiş gün qırmızı-mavi boş yerlə hündürləşirdi)
  const weekHas = rows.some((r) => days.includes(r.task_date));
  return (
    <Card as="section" className="!p-3">
      <div className="mb-2 flex items-center gap-2 px-1 max-sm:flex-nowrap">
        <button type="button" onClick={() => onDay(shift(day, -7))} className="icon-btn" aria-label="Əvvəlki həftə"><ChevronLeft size={18} /></button>
        <p className="whitespace-nowrap text-sm font-bold">{weekRange(from)}</p>
        <button type="button" onClick={() => onDay(shift(day, 7))} className="icon-btn" aria-label="Sonrakı həftə"><ChevronRight size={18} /></button>
        <p className="muted ml-2 truncate text-sm max-sm:hidden">{day === today ? "Bu gün" : formatDateAz(day)}</p>
        {day !== today && <Button type="button" onClick={() => onDay(today)} variant="soft" size="sm" className="ml-auto shrink-0 whitespace-nowrap max-sm:!h-7 max-sm:!px-2.5"><span className="max-sm:hidden">Bu günə qayıt</span><span className="sm:hidden">Bu gün</span></Button>}
      </div>
      <div className="grid grid-cols-7 gap-1.5">
        {days.map((d, i) => {
          // Qrup tapşırığı (0071) bir tapşırıq sayılır
          const count = new Set(rows.filter((r) => r.task_date === d).map((r, i) => r.group_id ?? `t${i}`)).size;
          const mineHere = rows.some((r) => r.task_date === d && r.employee_id === me);
          const selected = d === day;
          return (
            <button key={d} type="button" onClick={() => onDay(d)} aria-pressed={selected}
              className={`relative flex flex-col items-center rounded-xl py-2 transition-colors max-sm:py-1.5 ${
                selected ? "bg-gradient-to-br from-[#0f2a55] to-primary text-white shadow-[0_10px_24px_-12px_rgba(31,111,235,0.9)]"
                  : d === today ? "bg-primary-soft text-primary hover:bg-[#dbe8fd]" : "hover:bg-bg"}`}>
              <span className={`text-[11px] font-semibold ${selected ? "text-white/70" : "text-muted"}`}>{WEEKDAYS[i]}</span>
              <span className="text-lg font-extrabold tabular-nums leading-tight">{Number(d.slice(8))}</span>
              <span className={`mt-0.5 h-5 min-w-5 rounded-full ${weekHas ? "" : "hidden"} px-1.5 text-[11px] font-bold leading-5 tabular-nums ${
                count ? (selected ? "bg-white/20" : "bg-bg text-ink") : "opacity-0"}`}>{count}</span>
              {mineHere && <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-[#ff9f1c] max-sm:right-1 max-sm:top-1 max-sm:h-1.5 max-sm:w-1.5" title="Sənin tapşırığın var" />}
            </button>
          );
        })}
      </div>
    </Card>
  );
}
