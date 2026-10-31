import { ChevronLeft, ChevronRight, Sparkles, TrendingDown, TrendingUp } from "lucide-react";
import type { HeroTopProps } from "@/types/myWork";
import { MONTHS } from "../../utils/chart";

const navBtn = "grid h-9 w-9 place-items-center rounded-xl bg-white/15 text-white transition-colors hover:bg-white/25 disabled:opacity-40 disabled:hover:bg-white/15";

// Hero kartın üst hissəsi: ay, iri iş sayı, əvvəlki aya görə fərq; ay oxları, "Bu ay"; iş görülən gün və fərqli yer xanaları
export function HeroTop({ y, m, stats, loaded, diff, isCurrent, todayD, days, onPrev, onNext, onToday }: HeroTopProps) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div>
        <p className="flex items-center gap-1.5 text-sm font-semibold text-white/85"><Sparkles size={15} /> {MONTHS[m]} {y}</p>
        <div className="mt-1 flex items-end gap-3">
          <span className="text-7xl font-extrabold leading-none tracking-tight">{loaded ? stats.total : "…"}</span>
          <span className="pb-2 text-lg font-semibold text-white/85">iş</span>
        </div>
        {loaded && (
          <p className={`mt-3 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${diff < 0 ? "bg-rose-500/35" : "bg-white/20"}`}>
            {diff > 0 ? <TrendingUp size={13} /> : diff < 0 ? <TrendingDown size={13} /> : null}
            {diff > 0 ? `+${diff}` : diff < 0 ? `−${Math.abs(diff)}` : "Eyni"} <span className="font-medium text-white/80">əvvəlki aya görə</span>
          </p>
        )}
      </div>
      <div className="flex flex-col items-end gap-3 max-sm:w-full max-sm:items-stretch">
        <div className="flex items-center gap-1.5 max-sm:absolute max-sm:right-0 max-sm:top-0">
          <button type="button" onClick={onPrev} className={navBtn} aria-label="Əvvəlki ay"><ChevronLeft size={18} /></button>
          <button type="button" onClick={onNext} disabled={isCurrent} className={navBtn} aria-label="Sonrakı ay"><ChevronRight size={18} /></button>
          {!isCurrent && (
            <button type="button" onClick={onToday} className="rounded-xl bg-white px-3 py-2 text-xs font-bold text-primary">Bu ay</button>
          )}
        </div>
        <div className="flex gap-3 max-sm:[&>div]:flex-1">
          <div className="rounded-2xl bg-white/15 px-4 py-2.5 backdrop-blur">
            <p className="text-[11px] font-semibold text-white/75">İş görülən gün</p>
            <p className="text-2xl font-extrabold leading-tight">{stats.active}<span className="text-sm font-semibold text-white/70"> / {isCurrent ? todayD : days}</span></p>
          </div>
          <div className="rounded-2xl bg-white/15 px-4 py-2.5 backdrop-blur">
            <p className="text-[11px] font-semibold text-white/75">Fərqli yer</p>
            <p className="text-2xl font-extrabold leading-tight">{stats.placeCount}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
