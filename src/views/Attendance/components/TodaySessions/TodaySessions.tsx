import { timeBaku } from "@/shared/utils/timeBaku";
import type { TodaySessionsProps } from "@/types/attendance";
import { durShort } from "../../utils/durShort";
import { minutesBetween } from "../../utils/minutesBetween";

// Bugünkü seanslar: hər biri ayrıca sətir, nömrə ilə (yalnız bir gündə 2+ seans olanda); MyDay-dəki siyahı ilə eyni üslub
export function TodaySessions({ summary }: TodaySessionsProps) {
  const p = summary.today.presence;
  if (!p || p.sessions.length < 2) return null;

  return (
    <ol className="divide-y divide-line rounded-xl border border-line text-left">
      {p.sessions.map((x, i) => (
        <li key={x.in} className="flex items-center gap-2.5 px-2.5 py-1.5 text-[13px]">
          <span className={`grid h-5 w-5 shrink-0 place-items-center rounded-full text-[11px] font-bold ${x.out ? "bg-bg text-muted" : "bg-ok text-white"}`}>{i + 1}</span>
          <span className="whitespace-nowrap font-semibold tabular-nums">{timeBaku(x.in)} – {x.out ? timeBaku(x.out) : "…"}</span>
          <span className={`ml-auto whitespace-nowrap pl-2 text-xs font-semibold tabular-nums ${x.out ? "text-muted" : "text-ok"}`}>{x.out ? durShort(minutesBetween(x.in, x.out)) : "indi işdə"}</span>
        </li>
      ))}
    </ol>
  );
}
