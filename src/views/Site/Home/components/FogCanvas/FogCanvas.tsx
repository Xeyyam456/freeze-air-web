"use client";

import { useRef } from "react";
import { useFog } from "./useFog";

// Hero şəklinin üstündə şüşə buxarı: kursor çəkəndə silinir. Qalınlığı istiliklə artır (--warm), mətn onun üstündə qalır.
export function FogCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);
  useFog(ref);
  return (
    <canvas
      ref={ref}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 h-full w-full blur-[6px] transition-opacity duration-700"
      style={{ opacity: "calc(0.16 + var(--warm, 0) * 0.34)" }}
    />
  );
}
