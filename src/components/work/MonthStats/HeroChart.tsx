import { useMemo, useState } from "react";
import type { HeroChartProps } from "@/types/myWork";
import { MONTHS, niceTop, smoothPath, WEEKDAYS } from "./chart";

// Hero kartın içindəki əyri: ağ parlayan xətt, şəffaf ağ dolğu; hover/fokusda şaquli xətt, nöqtə və tooltip
export function HeroChart({ y, m, series, todayDay, cumulative }: HeroChartProps) {
  const days = series.length;
  const shown = todayDay ?? days; // cari ayda gələcək günlər çəkilmir
  const values = useMemo(() => {
    const raw = series.slice(0, shown);
    if (!cumulative) return raw;
    let acc = 0;
    return raw.map((v) => (acc += v));
  }, [series, shown, cumulative]);
  const max = Math.max(0, ...values);
  const top = niceTop(max * 1.15);
  const xOf = (i: number) => ((i + 0.5) / days) * 100;
  const yOf = (v: number) => 100 - (v / top) * 100;
  const pts = values.map((v, i) => [xOf(i), yOf(v)] as [number, number]);
  const line = smoothPath(pts);
  const area = pts.length > 1 ? `${line} L ${pts[pts.length - 1][0]} 100 L ${pts[0][0]} 100 Z` : "";
  const [hover, setHover] = useState<number | null>(null);
  const peak = cumulative ? values.length - 1 : max > 0 ? values.indexOf(max) : -1;

  return (
    <div>
      <div className="relative h-44" onMouseLeave={() => setHover(null)}>
        {[0, 0.5, 1].map((t) => <div key={t} className={`absolute inset-x-0 border-t ${t === 0 ? "border-white/40" : "border-white/15"}`} style={{ bottom: `${t * 100}%` }} />)}
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 h-full w-full overflow-visible" aria-hidden="true">
          <defs>
            <linearGradient id="ms-fill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#ffffff" stopOpacity="0.38" />
              <stop offset="1" stopColor="#ffffff" stopOpacity="0" />
            </linearGradient>
          </defs>
          {area && <path d={area} fill="url(#ms-fill)" />}
          {line && <path d={line} fill="none" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" style={{ filter: "drop-shadow(0 2px 8px rgba(10,26,51,0.35))" }} />}
        </svg>
        {peak >= 0 && values[peak] > 0 && hover === null && (
          <span className="pointer-events-none absolute grid h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-white shadow-[0_2px_10px_rgba(10,26,51,0.4)]"
            style={{ left: `${xOf(peak)}%`, top: `${yOf(values[peak])}%` }}>
            <span className="absolute -top-6 text-xs font-bold tabular-nums text-white">{values[peak]}</span>
          </span>
        )}
        <div className="absolute inset-0 flex">
          {Array.from({ length: days }, (_, i) => {
            const day = i + 1;
            const disabled = i >= shown;
            const wd = WEEKDAYS[new Date(y, m, day).getDay()];
            const align = i < days / 3 ? "left-0" : i > (days * 2) / 3 ? "right-0" : "left-1/2 -translate-x-1/2";
            return (
              <div key={day} tabIndex={disabled ? -1 : 0} onMouseEnter={() => !disabled && setHover(i)} onFocus={() => !disabled && setHover(i)} onBlur={() => setHover(null)}
                aria-label={disabled ? undefined : `${day} ${MONTHS[m].toLowerCase()}, ${wd}: ${series[i]} iş`}
                className="relative h-full flex-1 outline-none">
                {hover === i && !disabled && (
                  <>
                    <div className="pointer-events-none absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-white/60" />
                    <span className="pointer-events-none absolute left-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white shadow-[0_2px_12px_rgba(10,26,51,0.45)] ring-4 ring-white/30"
                      style={{ top: `${yOf(values[i])}%` }} />
                    <div role="tooltip" style={{ bottom: `calc(${(values[i] / top) * 100}% + 20px)` }}
                      className={`pointer-events-none absolute z-10 whitespace-nowrap rounded-xl bg-white px-3 py-2 text-xs text-ink shadow-[0_12px_32px_rgba(10,26,51,0.3)] ${align}`}>
                      <p className="text-sm font-bold">{series[i]} iş{cumulative && <span className="font-medium text-muted"> · yığım {values[i]}</span>}</p>
                      <p className="text-muted">{day} {MONTHS[m].toLowerCase()}, {wd}</p>
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>
      <div className="mt-2 flex" aria-hidden="true">
        {Array.from({ length: days }, (_, i) => (
          <span key={i} className={`flex-1 text-center text-[10px] tabular-nums ${i >= shown ? "text-white/30" : "text-white/75"}`}><span className="max-sm:hidden">{(i + 1) % 2 === 1 || days <= 16 ? i + 1 : ""}</span><span className="sm:hidden">{i === 0 || (i + 1) % 5 === 0 ? i + 1 : ""}</span></span>
        ))}
      </div>
    </div>
  );
}
