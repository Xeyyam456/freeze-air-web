"use client";

import { useRef } from "react";
import { useSnow } from "./useSnow";

// Hero üzərində qar yağışı (temperatur sürgüsü 20°-dən aşağı olanda). Başlığın, mətnin və formun da üstündədir;
// klikləri keçirir (pointer-events-none).
export function SnowCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);
  useSnow(ref);
  return <canvas ref={ref} aria-hidden="true" className="pointer-events-none absolute inset-0 z-10 h-full w-full" />;
}
