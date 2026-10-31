import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import type { HistoryTarget } from "@/types/myWork";
import { norm } from "@/shared/utils/norm";
import type { Store, UnitFilter } from "@/types/clients";

const hasCoords = (u: Store) => u.lat != null && u.lng != null;

// Siyahının vəziyyəti: axtarış (Ctrl+K-dan gələn ?q=KOD ilə süzülmüş açılır), "Koordinatsız" süzgəci, tarixçə pəncərəsi
export function useUnitList(units: Store[]) {
  const params = useSearchParams();
  const [query, setQuery] = useState(() => params.get("q") ?? "");
  const [filter, setFilter] = useState<UnitFilter>("all");
  const [historyFor, setHistoryFor] = useState<HistoryTarget | null>(null);
  const noCoords = useMemo(() => units.filter((u) => !hasCoords(u)).length, [units]);

  const filtered = useMemo(() => {
    const words = norm(query).split(/\s+/).filter(Boolean);
    return units.filter((u) => {
      if (filter === "nocoords" && hasCoords(u)) return false;
      const haystack = norm(`${u.code} ${u.name} ${u.address} ${u.phone}`);
      return words.every((w) => haystack.includes(w));
    });
  }, [units, query, filter]);

  return { query, setQuery, filter, setFilter, historyFor, setHistoryFor, noCoords, filtered };
}
