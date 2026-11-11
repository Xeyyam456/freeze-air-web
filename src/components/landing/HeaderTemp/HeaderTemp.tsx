"use client";

import { useEffect, useState } from "react";
import { Snowflake, Sun, Thermometer } from "lucide-react";
import s from "./HeaderTemp.module.css";

const EVENT = "climate-temp"; // views/Site/Home/components/HeroClimate/climate.ts ilə eyni ad

// Header-də hero sürgüsünün cari temperaturu: yalnız ana səhifədə görünür (sürgü kökə data-temp yazır),
// rəng soyuqda mavi, istidə isti tonda; klik səhifəni yuxarı, sürgüyə qaytarır.
export function HeaderTemp({ label }: { label: string }) {
  const [temp, setTemp] = useState<number | null>(null);
  useEffect(() => {
    const read = () => {
      const v = document.documentElement.dataset.temp;
      setTemp(v ? Number(v) : null);
    };
    read();
    window.addEventListener(EVENT, read);
    return () => window.removeEventListener(EVENT, read);
  }, []);
  if (temp === null) return null;
  const Icon = temp < 20 ? Snowflake : temp > 24 ? Sun : Thermometer;
  const tone = temp < 20 ? s.cold : temp > 24 ? s.hot : s.mild;
  return (
    <button
      type="button"
      title={label}
      aria-label={`${label}: ${temp}°`}
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      className={`${s.chip} ${tone} hidden items-center gap-1.5 rounded-full px-3 text-sm font-bold tabular-nums md:inline-flex`}
    >
      <Icon size={15} /> {temp}°
    </button>
  );
}
