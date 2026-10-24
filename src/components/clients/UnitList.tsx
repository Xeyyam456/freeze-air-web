"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Building2, Search, Store, X } from "lucide-react";
import { StoreCard } from "@/components/StoreCard";
import { PlaceHistoryModal, type HistoryTarget } from "@/components/work/PlaceHistory";
import type { Tables } from "@/lib/database.types";
import { KIND, type Kind } from "@/lib/kinds";

// Axtarış üçün sadələşdirmə: "Nərimanov" və "nerimanov" eyni tapılsın.
function norm(s: string | null | undefined) {
  return (s ?? "")
    .toLowerCase()
    .replace(/ə/g, "e").replace(/ı/g, "i").replace(/ö/g, "o").replace(/ü/g, "u")
    .replace(/ç/g, "c").replace(/ş/g, "s").replace(/ğ/g, "g");
}

const hasCoords = (u: Tables<"stores">) => u.lat != null && u.lng != null;

type Filter = "all" | "nocoords";

// Şirkətin filialları və ya marketin mağazaları: yapışan axtarış zolağı (+ "Koordinatsız" süzgəci) və kartlar; səhifə özü sürüşür
export function UnitList({ units, kind }: { units: Tables<"stores">[]; kind: Kind }) {
  // Ctrl+K axtarışından gələndə (?q=ARZ-045) siyahı həmin mağaza ilə süzülmüş açılır
  const params = useSearchParams();
  const [query, setQuery] = useState(() => params.get("q") ?? "");
  const [filter, setFilter] = useState<Filter>("all");
  const [historyFor, setHistoryFor] = useState<HistoryTarget | null>(null);
  const k = KIND[kind];
  const Icon = kind === "market" ? Store : Building2;
  const noCoords = useMemo(() => units.filter((u) => !hasCoords(u)).length, [units]);

  const filtered = useMemo(() => {
    const words = norm(query).split(/\s+/).filter(Boolean);
    return units.filter((u) => {
      if (filter === "nocoords" && hasCoords(u)) return false;
      const haystack = norm(`${u.code} ${u.name} ${u.address} ${u.phone}`);
      return words.every((w) => haystack.includes(w));
    });
  }, [units, query, filter]);

  if (units.length === 0) {
    return (
      <div className="card py-12 text-center">
        <span className="icon-tile mx-auto"><Icon size={20} /></span>
        <p className="mt-3 font-semibold">Hələ {k.unit} yoxdur</p>
      </div>
    );
  }

  const chip = (value: Filter, label: string, count: number) => (
    <button type="button" onClick={() => setFilter(value)} aria-pressed={filter === value}
      className={`flex h-11 shrink-0 items-center gap-2 rounded-xl px-4 text-sm font-semibold transition-colors max-sm:flex-1 max-sm:justify-center ${
        filter === value ? "bg-[#0c1b36] text-white" : "bg-surface text-muted ring-1 ring-line hover:text-ink"}`}>
      {label}
      <span className={`rounded-full px-2 py-0.5 text-xs tabular-nums ${filter === value ? "bg-white/15" : "bg-bg"}`}>{count}</span>
    </button>
  );

  return (
    <div>
      {historyFor && <PlaceHistoryModal key={historyFor.storeId} target={historyFor} onClose={() => setHistoryFor(null)} />}

      {/* Axtarış zolağı üst zolağın altında yapışıq qalır */}
      <div className="sticky top-[var(--topbar-h)] z-20 -mx-1 flex flex-wrap items-center gap-2 bg-bg/90 px-1 py-3 backdrop-blur">
        <label className="flex h-11 min-w-[240px] flex-1 items-center gap-2.5 max-sm:min-w-0 max-sm:basis-full rounded-xl bg-surface px-3.5 ring-1 ring-line focus-within:ring-2 focus-within:ring-primary">
          <Search size={18} className="shrink-0 text-muted" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={`${k.Unit} kodu, adı, ünvanı və ya telefonu...`}
            aria-label={`${k.Unit} axtarışı`}
            className="h-full min-w-0 flex-1 bg-transparent text-[15px] outline-none"
          />
          {query && (
            <button type="button" onClick={() => setQuery("")} className="text-muted hover:text-ink" aria-label="Axtarışı təmizlə">
              <X size={16} />
            </button>
          )}
        </label>
        {chip("all", "Hamısı", units.length)}
        {noCoords > 0 && chip("nocoords", "Koordinatsız", noCoords)}
      </div>

      {(query || filter !== "all") && (
        <p className="muted mb-3 text-sm font-medium">{filtered.length} {k.unit} göstərilir / cəmi {units.length}</p>
      )}

      {filtered.length === 0 ? (
        <div className="card muted mt-2 py-10 text-center text-sm">Bu axtarışa uyğun {k.unit} tapılmadı.</div>
      ) : (
        <div className="mt-1 grid grid-cols-[repeat(auto-fill,minmax(min(100%,380px),1fr))] gap-4 sm:max-lg:grid-cols-[repeat(auto-fill,minmax(300px,1fr))]">
          {filtered.map((u) => (
            <StoreCard key={u.id} store={u} onHistory={() => setHistoryFor({ title: `${u.code} ${u.name}`, storeId: u.id })} />
          ))}
        </div>
      )}
    </div>
  );
}
