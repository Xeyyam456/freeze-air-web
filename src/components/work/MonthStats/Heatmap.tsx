import type { HeatmapProps } from "@/types/myWork";
import { MONTHS, WEEKDAYS, WEEKDAYS_SHORT } from "./chart";

const cell = [
  "bg-bg text-muted",
  "bg-primary/25 text-primary-dark",
  "bg-primary/50 text-primary-dark",
  "bg-primary/75 text-white",
  "bg-gradient-to-br from-primary to-frost text-white shadow-[0_4px_12px_rgba(31,111,235,0.35)]",
];

// Kalendar istilik xəritəsi: ayın hər günü bir xana, iş sayına görə rənglənir (az → çox). Bugün halqa ilə.
export function Heatmap({ y, m, counts, todayDay }: HeatmapProps) {
  const offset = (new Date(y, m, 1).getDay() + 6) % 7; // bazar ertəsi = 0
  const max = Math.max(1, ...counts);
  const level = (c: number) => (c === 0 ? 0 : Math.min(4, Math.ceil((c / max) * 4)));
  return (
    <div>
      <div className="mb-2 grid grid-cols-7 gap-1.5 text-center text-[11px] font-semibold text-muted">
        {WEEKDAYS_SHORT.map((w) => <span key={w}>{w}</span>)}
      </div>
      <div className="grid grid-cols-7 gap-1.5">
        {Array.from({ length: offset }, (_, i) => <span key={`e${i}`} />)}
        {counts.map((c, i) => {
          const day = i + 1;
          const future = todayDay !== null && day > todayDay;
          const wd = WEEKDAYS[new Date(y, m, day).getDay()];
          return (
            <div key={day} tabIndex={0} aria-label={`${day} ${MONTHS[m].toLowerCase()}, ${wd}: ${c} iş`}
              className={`group relative grid h-11 cursor-pointer place-items-center rounded-xl text-sm font-bold tabular-nums outline-none transition-transform hover:scale-105 focus-visible:scale-105 ${future ? "bg-bg/50 text-line" : cell[level(c)]} ${todayDay === day ? "ring-1 ring-ink/60 ring-offset-1" : ""}`}>
              {day}
              {!future && (
                <span role="tooltip" className="pointer-events-none absolute bottom-full z-10 mb-1.5 hidden whitespace-nowrap rounded-lg bg-ink px-2.5 py-1.5 text-xs font-semibold text-white shadow-lg group-hover:block group-focus-visible:block">
                  {c} iş · {day} {MONTHS[m].toLowerCase()}
                </span>
              )}
            </div>
          );
        })}
      </div>
      <div className="mt-4 flex items-center justify-end gap-2 text-[11px] font-medium text-muted" aria-hidden="true">
        az {cell.map((c, i) => <span key={i} className={`h-3.5 w-3.5 rounded-md ${c.split(" ")[0]} ${i === 4 ? "bg-gradient-to-br from-primary to-frost" : ""}`} />)} çox
      </div>
    </div>
  );
}
