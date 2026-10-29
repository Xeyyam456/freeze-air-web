import type { PeriodCardProps } from "@/types/myFuel";
import { azn, BAL_CLS } from "../../shared/money";
import { PERIOD_TOTAL } from "../../shared/period";
import { balanceText } from "../../utils/balanceText";

// Seçilmiş dövrün yanacaq pulu: sürülən km-ə görə; altda ayın balansı (0080: ayda alınan − ayda sərf)
export function PeriodCard({ period, range, monthR, total, month, balance }: PeriodCardProps) {
  const bal = balanceText(balance);
  return (
    <div className="flex flex-col rounded-2xl bg-gradient-to-br from-frost/25 to-primary/30 px-5 py-4 ring-1 ring-frost/30 max-sm:rounded-xl max-sm:px-3 max-sm:py-2.5">
      <p className="text-xs font-semibold uppercase tracking-wider text-white/70 max-sm:tracking-normal">{PERIOD_TOTAL[period]}<span className="max-lg:hidden"> · {range.label}</span></p>
      <div className="mt-1 flex flex-wrap items-center justify-between gap-x-3 gap-y-1 max-sm:mt-0.5">
        <p className="text-4xl font-extrabold tabular-nums leading-tight max-lg:text-3xl max-sm:text-2xl">{azn(total.cost)}</p>
        <p className="flex flex-wrap gap-1.5 text-xs font-semibold tabular-nums text-white/80 max-sm:gap-1 max-sm:text-[11px]">
          {[`${total.km.toLocaleString("az")} km`, `${total.liters.toFixed(1)} L`, `${total.days}/${range.workdays} gün`].map((t) => (
            <span key={t} className="whitespace-nowrap rounded-md bg-white/10 px-2 py-0.5 max-sm:px-1.5">{t}</span>
          ))}
        </p>
      </div>
      <div className="mt-auto border-t border-white/15 pt-2.5 max-sm:mt-2 max-sm:pt-2">
        <p className={`mb-1.5 flex items-center justify-between gap-2 text-xs font-semibold max-sm:mb-1 ${BAL_CLS[bal.tone]}`}>
          <span>{bal.text}</span>
          <span className="text-[11px] font-medium text-white/50 max-[400px]:hidden">{monthR.label}</span>
        </p>
        <div className="grid grid-cols-3 gap-2 max-sm:gap-1">
          {([["Ayda sərf", azn(month.cost), ""], ["Ayda aldığın", azn(month.paid), ""],
            ["Ayın balansı", `${balance > 0 ? "+" : ""}${azn(balance)}`, BAL_CLS[bal.tone]]] as const).map(([l, v, c]) => (
            <div key={l} className="min-w-0 rounded-lg bg-white/[0.08] px-2.5 py-1.5 text-center max-sm:px-1 max-sm:py-1">
              <p className="truncate text-[11px] text-white/55 max-sm:text-[10px]">{l}</p>
              <p className={`whitespace-nowrap text-sm font-extrabold tabular-nums max-[400px]:text-xs ${c}`}>{v}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
