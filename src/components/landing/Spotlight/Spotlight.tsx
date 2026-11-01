"use client";

import type { SpotlightProps } from "@/types/site";
import s from "./Spotlight.module.css";

// Kartın üzərində kursoru izləyən yumşaq işıq: mövqe CSS dəyişənləri ilə ötürülür (`.spotlight`, globals.css)
export function Spotlight({ className = "", children }: SpotlightProps) {
  return (
    <div
      className={`${s.spot} ${className}`}
      onPointerMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        e.currentTarget.style.setProperty("--mx", `${e.clientX - r.left}px`);
        e.currentTarget.style.setProperty("--my", `${e.clientY - r.top}px`);
      }}>
      {children}
    </div>
  );
}
