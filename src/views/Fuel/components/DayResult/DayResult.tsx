import { Check, Fuel, Route } from "lucide-react";
import type { DayResultProps } from "@/types/myFuel";
import { FUEL_LABEL } from "../../shared/fuelTypes";
import { azn } from "../../shared/money";

// Günün yekunu: axşam km yazılandan sonra (km × sərf / 100 × həmin növün qiyməti)
export function DayResult({ live }: DayResultProps) {
  return (
    <div className="relative mt-3 overflow-hidden rounded-2xl bg-[linear-gradient(135deg,#15803d,#16a34a_55%,#22c55e)] px-5 py-4 text-white shadow-[0_14px_30px_-14px_rgba(18,161,80,0.9)] max-sm:mt-2 max-sm:rounded-xl max-sm:px-4 max-sm:py-3">
      {/* bəzək: yumşaq dairə + solğun yol ikonu */}
      <span aria-hidden className="pointer-events-none absolute -right-10 -top-12 h-36 w-36 rounded-full bg-white/10" />
      <Route aria-hidden size={84} strokeWidth={1.4} className="pointer-events-none absolute -bottom-3 right-3 text-white/10 max-sm:hidden" />
      <p className="relative flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-white/85">
        <span className="grid h-5 w-5 place-items-center rounded-full bg-white/20"><Check size={12} strokeWidth={3} /></span> Günün yekunu
      </p>
      <div className="relative mt-2 grid grid-cols-2 divide-x divide-white/20 max-sm:mt-1.5">
        <div className="pr-4 max-sm:pr-3">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-white/65">Getdin</p>
          <p className="text-3xl font-extrabold tabular-nums leading-tight max-sm:text-2xl">{live.km} <span className="text-base font-bold text-white/75 max-sm:text-sm">km</span></p>
        </div>
        <div className="pl-4 max-sm:pl-3">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-white/65">Yanacaq pulu</p>
          <p className="text-3xl font-extrabold tabular-nums leading-tight max-sm:text-2xl">{live.cost != null ? azn(Number(live.cost)) : "—"}</p>
        </div>
      </div>
      {live.liters != null && (
        <p className="relative mt-2.5 flex items-center gap-1.5 whitespace-nowrap border-t border-white/20 pt-2 text-xs font-semibold text-white/85 max-sm:mt-2 max-sm:text-[11px]">
          <Fuel size={13} className="shrink-0 text-white/70" /> Günlük sərf edilən yanacaq: <b className="text-white">{Number(live.liters).toFixed(2)} L{live.fuel_type ? ` ${FUEL_LABEL[live.fuel_type]?.toLowerCase()}` : ""}</b>
        </p>
      )}
      <p className="relative mt-2 flex flex-wrap gap-1.5 text-xs font-semibold tabular-nums text-white/90 max-sm:mt-2 max-sm:gap-1 max-sm:text-[11px]">
        {[
          `${live.start_km.toLocaleString("az")} → ${live.end_km!.toLocaleString("az")} km`,
          live.fuel_price != null ? `${live.fuel_price} ₼ / L` : null,
        ].filter(Boolean).map((t) => <span key={t} className="whitespace-nowrap rounded-full bg-white/15 px-2.5 py-0.5 max-sm:px-2">{t}</span>)}
      </p>
    </div>
  );
}
