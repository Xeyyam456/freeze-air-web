import type { DailyRowProps } from "@/types/myFuel";
import { d12, WEEKDAY_SHORT } from "../../shared/dates";
import { azn } from "../../shared/money";

export function DailyRow({ r, got, maxKm, today }: DailyRowProps) {
  const isToday = r.day === today;
  return (
    <li className={`grid grid-cols-[44px_minmax(0,1fr)_auto] items-center gap-3 px-4 py-2.5 max-sm:gap-2.5 max-sm:px-3 ${isToday ? "bg-primary-soft/40" : ""}`}>
      <div className={`grid h-11 w-11 place-items-center rounded-xl text-center leading-none ${isToday ? "bg-primary text-white" : "bg-bg"}`}>
        <span><b className="block text-base tabular-nums">{Number(r.day.slice(8))}</b><span className={`text-[10px] font-semibold ${isToday ? "text-white/80" : "text-muted"}`}>{WEEKDAY_SHORT[d12(r.day).getUTCDay()]}</span></span>
      </div>
      <div className="min-w-0">
        <p className="flex items-baseline gap-x-2 gap-y-0.5 whitespace-nowrap">
          <b className="text-[15px] tabular-nums">{r.km != null ? r.km.toLocaleString("az") : "—"} <span className="text-xs font-semibold text-muted">km</span></b>
          <span className="muted truncate text-xs tabular-nums max-sm:hidden">
            {r.start_km.toLocaleString("az")} → {r.end_km != null ? r.end_km.toLocaleString("az") : "axşam yazılmayıb"}{r.liters != null && ` · ${Number(r.liters).toFixed(1)} L`}
          </span>
          {isToday && <span className="rounded-full bg-primary-soft px-1.5 text-[10px] font-bold text-primary sm:hidden">bu gün</span>}
        </p>
        <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-bg" aria-hidden>
          <div className="h-full rounded-full bg-gradient-to-r from-frost to-primary" style={{ width: `${Math.max(3, ((r.km ?? 0) / maxKm) * 100)}%` }} />
        </div>
      </div>
      <div className="text-right">
        <p className="font-extrabold tabular-nums">{r.cost != null ? azn(Number(r.cost)) : "—"}</p>
        <p className={`text-xs font-semibold tabular-nums ${got ? "text-ok" : "text-muted"}`}>{got ? `+${azn(got)}` : "—"}</p>
      </div>
    </li>
  );
}
