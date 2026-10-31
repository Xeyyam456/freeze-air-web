import type { FilterChipProps } from "@/types/clients";

export function FilterChip({ active, label, count, onClick }: FilterChipProps) {
  return (
    <button type="button" onClick={onClick} aria-pressed={active}
      className={`flex h-11 shrink-0 items-center gap-2 rounded-xl px-4 text-sm font-semibold transition-colors max-sm:flex-1 max-sm:justify-center ${
        active ? "bg-[#0c1b36] text-white" : "bg-surface text-muted ring-1 ring-line hover:text-ink"}`}>
      {label}
      <span className={`rounded-full px-2 py-0.5 text-xs tabular-nums ${active ? "bg-white/15" : "bg-bg"}`}>{count}</span>
    </button>
  );
}
