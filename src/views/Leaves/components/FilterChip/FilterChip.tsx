"use client";

import type { FilterChipProps } from "@/types/leaves";

// Tarixçə süzgəci çipi: ad + sorğu sayı
export function FilterChip({ active, label, count, onClick }: FilterChipProps) {
  return (
    <button type="button" onClick={onClick} aria-pressed={active}
      className={`flex h-9 items-center gap-2 rounded-xl px-3.5 text-sm font-semibold transition-colors max-sm:h-7 max-sm:text-[13px] max-sm:justify-center max-sm:px-2 ${
        active ? "bg-[#0c1b36] text-white" : "bg-surface text-muted ring-1 ring-line hover:text-ink"}`}>
      {label}<span className={`rounded-full px-1.5 text-xs tabular-nums ${active ? "bg-white/15" : "bg-bg"}`}>{count}</span>
    </button>
  );
}
