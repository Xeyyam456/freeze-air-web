"use client";

import { useEffect, useRef, useState } from "react";
import { Snowflake, Sun } from "lucide-react";
import type { HeroClimateProps } from "@/types/site";
import { applyTemp, BASE_TEMP, MAX_TEMP, MIN_TEMP } from "./climate";
import s from "./HeroClimate.module.css";

// Çöl nişanı + içəri temperatur sürgüsü: sürüşdürəndə otağın işığı, hava axını və şüşə buxarı dəyişir
export function HeroClimate({ out, inn }: HeroClimateProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [temp, setTemp] = useState(BASE_TEMP);
  useEffect(() => {
    const host = ref.current?.closest("section") as HTMLElement | null;
    applyTemp(temp, host);
    return () => { if (temp === BASE_TEMP) applyTemp(BASE_TEMP, host); };
  }, [temp]);
  const label = inn.replace(/\d+/, String(temp));
  return (
    <div ref={ref} className="hero-in flex flex-wrap items-center gap-2 text-sm font-semibold">
      <span className="inline-flex items-center gap-1.5 rounded-full bg-heat/20 px-3 py-1.5 text-[#ffd08a]"><Sun size={15} /> {out}</span>
      <label className={`${s.pill} inline-flex items-center gap-2.5 rounded-full bg-white/15 py-1.5 pl-3 pr-4 text-ice`}>
        <Snowflake size={15} className={s.flake} />
        <span className="tabular-nums">{label}</span>
        <input type="range" min={MIN_TEMP} max={MAX_TEMP} step={1} value={temp} onChange={(e) => setTemp(Number(e.target.value))} aria-label={inn} aria-valuetext={`${temp}°`} className={s.range} />
      </label>
    </div>
  );
}
