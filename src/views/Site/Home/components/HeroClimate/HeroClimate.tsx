"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowLeft, ChevronLeft, ChevronRight, Snowflake, Sun } from "lucide-react";
import type { HeroClimateProps } from "@/types/site";
import { applyTemp, BASE_TEMP, MAX_TEMP, MIN_TEMP } from "./climate";
import s from "./HeroClimate.module.css";

// Çöl nişanı + içəri temperatur sürgüsü: sürüşdürəndə otağın işığı, hava axını və şüşə buxarı dəyişir.
// Ziyarətçi sürgünü fərq etsin deyə: tutacaq nəbz vurur və yanında işarə yazısı var; ilk toxunuşdan sonra ikisi də itir.
export function HeroClimate({ out, inn, hint }: HeroClimateProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [temp, setTemp] = useState(BASE_TEMP);
  const [touched, setTouched] = useState(false);
  useEffect(() => {
    const host = ref.current?.closest("section") as HTMLElement | null;
    applyTemp(temp, host);
    return () => { if (temp === BASE_TEMP) applyTemp(BASE_TEMP, host); };
  }, [temp]);
  const label = inn.replace(/\d+/, String(temp));
  return (
    <div ref={ref} className="hero-in flex flex-wrap items-center gap-x-3 gap-y-2 text-sm font-semibold">
      <span className="inline-flex items-center gap-1.5 rounded-full bg-heat/20 px-3 py-1.5 text-[#ffd08a]"><Sun size={15} /> {out}</span>
      <label className={`${s.pill} inline-flex items-center gap-2.5 rounded-full bg-white/15 py-1.5 pl-3 pr-4 text-ice`}>
        <Snowflake size={15} className={s.flake} />
        <span className="tabular-nums">{label}</span>
        <ChevronLeft size={15} strokeWidth={3} className={`${s.arrow} ${touched ? s.arrowGone : ""}`} />
        <input
          type="range" min={MIN_TEMP} max={MAX_TEMP} step={1} value={temp}
          onChange={(e) => { setTemp(Number(e.target.value)); setTouched(true); }}
          onPointerDown={() => setTouched(true)}
          aria-label={inn} aria-valuetext={`${temp}°`}
          className={`${s.range} ${touched ? "" : s.pulse}`}
        />
        <ChevronRight size={15} strokeWidth={3} className={`${s.arrow} ${s.arrowR} ${touched ? s.arrowGone : ""}`} />
      </label>
      {hint && (
        <span aria-hidden="true" className={`${s.hint} ${touched ? s.gone : ""}`}>
          <ArrowLeft size={14} className={s.nudge} /> {hint}
        </span>
      )}
    </div>
  );
}
