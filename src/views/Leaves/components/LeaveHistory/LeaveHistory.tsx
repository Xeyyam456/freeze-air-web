"use client";

import { History } from "lucide-react";
import { MONTHS_AZ } from "@/shared/utils/monthsAz";
import type { LeaveHistoryProps } from "@/types/leaves";
import { FilterChip } from "../FilterChip";
import { LeaveCard } from "../LeaveCard";

const CHIPS = [["all", "Hamısı"], ["approved", "Təsdiqlənən"], ["rejected", "Rədd edilən"], ["cancelled", "Ləğv etdiyim"]] as const;

// Tarixçə: vəziyyət çipləri, aylara görə qruplaşmış keçmiş sorğular
export function LeaveHistory({ filter, counts, total, byMonth, today, onFilter }: LeaveHistoryProps) {
  return (
    <section>
      <div className="mb-3 flex flex-wrap items-center gap-2 max-sm:grid max-sm:grid-cols-2">
        <h2 className="mr-auto flex items-center gap-2 text-base font-bold max-sm:col-span-2"><History size={18} className="text-primary" /> Tarixçə</h2>
        {CHIPS.map(([value, label]) => <FilterChip key={value} active={filter === value} label={label} count={counts[value]} onClick={() => onFilter(value)} />)}
      </div>
      {byMonth.length === 0 ? (
        <p className="card muted py-8 text-center text-sm">{total ? "Bu süzgəcə uyğun sorğu yoxdur." : "Hələ keçmiş icazən yoxdur."}</p>
      ) : (
        <div className="space-y-5">
          {byMonth.map(([k, list]) => (
            <div key={k}>
              <p className="muted mb-2 text-xs font-semibold uppercase tracking-wider">{MONTHS_AZ[Number(k.slice(5, 7)) - 1]} {k.slice(0, 4)}</p>
              <ul className="space-y-2.5">{list.map((l) => <LeaveCard key={l.id} leave={l} today={today} />)}</ul>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
