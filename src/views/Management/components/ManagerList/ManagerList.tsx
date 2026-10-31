"use client";

import { UserCog } from "lucide-react";
import type { ManagerListProps } from "@/types/management";
import { rank, sortManagers } from "../../utils/rank";
import { LeadCard } from "../LeadCard";
import { ManagerCard } from "../ManagerCard";
import { Card } from "@/shared/components/Card";

// Rəhbərlik (yalnız baxış): müdir üstdə iri kartda, altında digər rəhbərlər; klik → məlumat pəncərəsi
export function ManagerList({ managers }: ManagerListProps) {
  if (managers.length === 0) {
    return (
      <Card className="py-12 text-center">
        <span className="icon-tile mx-auto"><UserCog size={20} /></span>
        <p className="mt-3 font-semibold">Hələ rəhbər əlavə olunmayıb</p>
      </Card>
    );
  }

  const sorted = sortManagers(managers);
  const lead = rank(sorted[0].position) === 0 ? sorted[0] : null;
  const rest = lead ? sorted.slice(1) : sorted;

  return (
    <div className="space-y-6">
      {lead && <LeadCard manager={lead} />}
      {rest.length > 0 && (
        <section>
          <h2 className="muted mb-3 text-xs font-semibold uppercase tracking-wider">{lead ? "Komanda rəhbərləri" : "Rəhbərlik"} · {rest.length}</h2>
          <div className="flex flex-wrap gap-4">
            {rest.map((m) => <div key={m.id} className="flex min-w-0 grow basis-[320px] [&>*]:flex-1"><ManagerCard manager={m} /></div>)}
          </div>
        </section>
      )}
    </div>
  );
}
