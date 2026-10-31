import { Search, X } from "lucide-react";
import { KIND } from "@/lib/kinds";
import type { UnitSearchProps } from "@/types/clients";
import { FilterChip } from "./FilterChip";

// Axtarış zolağı üst zolağın altında yapışıq qalır: axtarış + "Hamısı / Koordinatsız" süzgəci
export function UnitSearch({ kind, query, onQuery, filter, onFilter, total, noCoords }: UnitSearchProps) {
  const k = KIND[kind];
  return (
    <div className="sticky top-[var(--topbar-h)] z-20 -mx-1 flex flex-wrap items-center gap-2 bg-bg/90 px-1 py-3 backdrop-blur">
      <label className="flex h-11 min-w-[240px] flex-1 items-center gap-2.5 max-sm:min-w-0 max-sm:basis-full rounded-xl bg-surface px-3.5 ring-1 ring-line focus-within:ring-2 focus-within:ring-primary">
        <Search size={18} className="shrink-0 text-muted" />
        <input
          value={query}
          onChange={(e) => onQuery(e.target.value)}
          placeholder={`${k.Unit} kodu, adı, ünvanı və ya telefonu...`}
          aria-label={`${k.Unit} axtarışı`}
          className="h-full min-w-0 flex-1 bg-transparent text-[15px] outline-none"
        />
        {query && (
          <button type="button" onClick={() => onQuery("")} className="text-muted hover:text-ink" aria-label="Axtarışı təmizlə">
            <X size={16} />
          </button>
        )}
      </label>
      <FilterChip active={filter === "all"} label="Hamısı" count={total} onClick={() => onFilter("all")} />
      {noCoords > 0 && <FilterChip active={filter === "nocoords"} label="Koordinatsız" count={noCoords} onClick={() => onFilter("nocoords")} />}
    </div>
  );
}
