"use client";

import { useRef } from "react";
import { useAirflow } from "./useAirflow";

// Hero şəklindəki kondisionerdən çıxan soyuq hava: nazik, yarımşəffaf axın xətləri.
export function AirflowCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);
  useAirflow(ref);
  return <canvas ref={ref} aria-hidden="true" className="pointer-events-none absolute inset-0 h-full w-full mix-blend-screen" />;
}
