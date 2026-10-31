"use client";

import { PlaceHistoryModal } from "@/components/work/PlaceHistory";
import { StoreCard } from "@/components/StoreCard";
import { KIND } from "@/lib/kinds";
import type { UnitListProps } from "@/types/clients";
import { useUnitList } from "../../hooks/useUnitList";
import { EmptyUnits } from "./EmptyUnits";
import { UnitSearch } from "./UnitSearch";

// Şirkətin filialları və ya marketin mağazaları: yapışan axtarış zolağı (+ "Koordinatsız" süzgəci) və kartlar; səhifə özü sürüşür
export function UnitList({ units, kind }: UnitListProps) {
  const l = useUnitList(units);
  const k = KIND[kind];

  if (units.length === 0) return <EmptyUnits kind={kind} />;

  return (
    <div>
      {l.historyFor && <PlaceHistoryModal key={l.historyFor.storeId} target={l.historyFor} onClose={() => l.setHistoryFor(null)} />}

      <UnitSearch kind={kind} query={l.query} onQuery={l.setQuery} filter={l.filter} onFilter={l.setFilter} total={units.length} noCoords={l.noCoords} />

      {(l.query || l.filter !== "all") && (
        <p className="muted mb-3 text-sm font-medium">{l.filtered.length} {k.unit} göstərilir / cəmi {units.length}</p>
      )}

      {l.filtered.length === 0 ? (
        <div className="card muted mt-2 py-10 text-center text-sm">Bu axtarışa uyğun {k.unit} tapılmadı.</div>
      ) : (
        <div className="mt-1 grid grid-cols-[repeat(auto-fill,minmax(min(100%,380px),1fr))] gap-4 sm:max-lg:grid-cols-[repeat(auto-fill,minmax(300px,1fr))]">
          {l.filtered.map((u) => (
            <StoreCard key={u.id} store={u} onHistory={() => l.setHistoryFor({ title: `${u.code} ${u.name}`, storeId: u.id })} />
          ))}
        </div>
      )}
    </div>
  );
}
