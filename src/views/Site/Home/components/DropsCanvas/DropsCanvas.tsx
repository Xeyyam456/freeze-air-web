"use client";

import { useRef } from "react";
import { useDrops } from "./useDrops";

// Hero şüşəsinin üzərində su damcıları: bəziləri süzülüb iz buraxır, istidə çoxalır
export function DropsCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);
  useDrops(ref);
  return <canvas ref={ref} aria-hidden="true" className="pointer-events-none absolute inset-0 h-full w-full" />;
}
