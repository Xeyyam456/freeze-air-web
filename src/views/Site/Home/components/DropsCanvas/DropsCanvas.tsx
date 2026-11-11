"use client";

import { useRef } from "react";
import { useDrops } from "./useDrops";

// Hero şüşəsinin üzərində su damcıları: bəziləri süzülüb iz buraxır, istidə çoxalır.
// z-10: damcılar başlığın, mətnin və formun da üstündədir (klikləri keçirir: pointer-events-none)
export function DropsCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);
  useDrops(ref);
  return <canvas ref={ref} aria-hidden="true" className="pointer-events-none absolute inset-0 z-10 h-full w-full" />;
}
