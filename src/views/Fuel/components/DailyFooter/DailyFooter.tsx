import type { DailyFooterProps } from "@/types/myFuel";
import { azn } from "../../shared/money";

// Cəmi: günlər, km, litr; sərf, alınan və fərq (mənfi: borc, müsbət: artıq alınıb)
export function DailyFooter({ total, paid, range }: DailyFooterProps) {
  const diff = Math.round((paid - total.cost) * 100) / 100;
  return (
    <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 border-t border-line bg-[#f8fafc] px-4 py-3 max-sm:px-3 max-sm:py-2.5">
      <p className="text-sm font-bold">Cəmi <span className="font-semibold text-muted">· {total.days}/{range.workdays} gün · {total.km.toLocaleString("az")} km · {total.liters.toFixed(1)} L</span></p>
      <p className="flex items-center gap-2 text-sm font-extrabold tabular-nums">
        <span>{azn(total.cost)}</span>
        <span className="text-ok">+{azn(paid)}</span>
        <span className={`rounded-full px-2 py-0.5 text-xs ${diff < 0 ? "bg-[#fff0f0] text-[#dc2626]" : diff > 0 ? "bg-[#fff6e5] text-amber-700" : "bg-ok-soft text-ok"}`}>{diff > 0 ? "+" : ""}{azn(diff)}</span>
      </p>
    </div>
  );
}
