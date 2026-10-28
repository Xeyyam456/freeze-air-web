import type { SegProps } from "@/types/myTools";

export function Seg({ value, onChange, items }: SegProps) {
  return (
    <span className="inline-flex shrink-0 gap-0.5 rounded-lg bg-line/60 p-0.5">
      {items.map(([v, l]) => (
        <button key={String(v)} type="button" aria-pressed={value === v} onClick={() => onChange(v)}
          className={`h-7 rounded-md px-2.5 text-xs font-semibold transition-colors ${value === v ? "bg-surface text-ink shadow-sm" : "text-muted hover:text-ink"}`}>
          {l}
        </button>
      ))}
    </span>
  );
}
