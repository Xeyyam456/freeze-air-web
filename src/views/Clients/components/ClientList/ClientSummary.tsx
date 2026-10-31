import { Building2, Store } from "lucide-react";
import { KIND } from "@/lib/kinds";
import type { ClientSummaryProps } from "@/types/clients";
import { coordPercent } from "../../utils/coordPercent";

// Xülasə: neçə müştəri, neçə filial/mağaza, koordinat örtüyü, bu ay görülən iş
export function ClientSummary({ kind, count, totals }: ClientSummaryProps) {
  const k = KIND[kind];
  const Icon = kind === "market" ? Store : Building2;

  return (
    <section className="flex flex-wrap items-center gap-x-10 gap-y-4 rounded-[18px] bg-[#0c1b36] bg-[radial-gradient(520px_220px_at_100%_0%,rgba(34,195,230,0.22),transparent_70%)] px-6 py-5 text-white max-sm:gap-y-3 max-sm:px-4">
      <div className="flex items-center gap-4">
        <span className="grid h-14 w-14 place-items-center rounded-2xl bg-white/10 text-frost"><Icon size={26} /></span>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-white/50">{k.section}</p>
          <p className="text-2xl font-extrabold leading-tight">{count} {k.one}</p>
        </div>
      </div>
      <dl className="flex flex-1 flex-wrap gap-x-10 gap-y-3 max-sm:grid max-sm:basis-full max-sm:grid-cols-2 max-sm:gap-2 max-sm:[&>div]:rounded-xl max-sm:[&>div]:bg-white/[0.07] max-sm:[&>div]:px-3 max-sm:[&>div]:py-2 max-sm:[&_dd]:text-xl max-sm:[&>div:last-child:nth-child(odd)]:col-span-2">
        <div>
          <dt className="text-xs text-white/55">{k.Unit} cəmi</dt>
          <dd className="text-2xl font-extrabold tabular-nums">{totals.units}</dd>
        </div>
        {kind === "company" && (
          <div>
            <dt className="text-xs text-white/55">Sabit məkan</dt>
            <dd className="text-2xl font-extrabold tabular-nums">{totals.fixed}</dd>
          </div>
        )}
        {totals.units > 0 && (
          <div>
            <dt className="text-xs text-white/55">Koordinatlı</dt>
            <dd className="text-2xl font-extrabold tabular-nums">{coordPercent(totals.coords, totals.units)}%</dd>
          </div>
        )}
        <div>
          <dt className="text-xs text-white/55">Bu ay iş</dt>
          <dd className="text-2xl font-extrabold tabular-nums text-frost">{totals.works}</dd>
        </div>
      </dl>
    </section>
  );
}
