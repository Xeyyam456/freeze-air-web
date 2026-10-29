import type { TodayCardProps } from "@/types/myFuel";
import { dayName } from "../../shared/dates";
import { azn } from "../../shared/money";

// Bu günün hesabatı: dövr filtrindən asılı deyil
export function TodayCard({ today, row }: TodayCardProps) {
  const tone = !row ? "none" : row.end_km == null ? "open" : "done";
  const liters = row?.liters != null ? `${Number(row.liters).toFixed(2)} L` : "— L";
  const cost = row?.cost != null ? azn(Number(row.cost)) : "—";
  return (
    <div className="flex flex-col rounded-2xl bg-white/[0.07] px-5 py-4 ring-1 ring-white/10 max-sm:flex-row max-sm:items-center max-sm:justify-between max-sm:gap-3 max-sm:rounded-xl max-sm:px-3 max-sm:py-2.5">
      <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-white/60 max-sm:whitespace-nowrap max-sm:tracking-normal max-[360px]:text-[11px]">
        <span className={`h-2 w-2 shrink-0 rounded-full ${tone === "done" ? "bg-[#4ade80]" : tone === "open" ? "bg-amber-400" : "bg-white/30"}`} />
        <span>Bu gün<span className="max-[400px]:hidden"> · {dayName(today)}</span></span>
      </p>
      <div className="mt-2 flex flex-wrap items-end gap-x-8 gap-y-2 max-lg:hidden">
        <p className="text-3xl font-extrabold tabular-nums leading-none">{row?.km ?? 0} <span className="text-base font-bold text-white/60">km</span></p>
        <p className="tabular-nums text-white/80">{liters}</p>
        <p className="text-2xl font-extrabold tabular-nums text-[#4ade80]">{cost}</p>
      </div>
      <p className="flex shrink-0 items-baseline gap-2 tabular-nums sm:hidden">
        <b className="text-base font-extrabold">{row?.km ?? 0} <span className="text-xs font-semibold text-white/60">km</span></b>
        <span className="text-xs text-white/60 max-[400px]:hidden">{liters}</span>
        <b className="text-base font-extrabold text-[#4ade80]">{cost}</b>
      </p>
      <div className="mt-3 grid grid-cols-3 gap-2 max-sm:hidden lg:hidden">
        {([["Km", String(row?.km ?? 0), ""], ["Litr", row?.liters != null ? Number(row.liters).toFixed(2) : "—", ""],
          ["Məbləğ", cost, "text-[#4ade80]"]] as const).map(([l, v, c]) => (
          <div key={l} className="rounded-xl bg-white/[0.07] px-3 py-2">
            <p className="text-[11px] text-white/55">{l}</p>
            <p className={`text-lg font-extrabold tabular-nums leading-tight ${c}`}>{v}</p>
          </div>
        ))}
      </div>
      <p className="mt-2 text-xs text-white/60 max-sm:hidden sm:max-lg:mt-auto sm:max-lg:pt-2">
        {!row ? "Bu gün hələ yazılmayıb: səhər spidometri yaz"
          : row.end_km == null ? `Açıqdır · səhər ${row.start_km.toLocaleString("az")} km, axşam yaz`
          : `${row.start_km.toLocaleString("az")} → ${row.end_km.toLocaleString("az")} km${row.fuel_price != null ? ` · ${row.fuel_price} ₼ / L` : ""}`}
      </p>
    </div>
  );
}
