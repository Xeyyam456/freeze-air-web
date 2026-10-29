import type { FuelTopProps } from "@/types/myFuel";
import { CarInfo } from "../CarInfo";
import { PeriodCard } from "../PeriodCard";
import { PeriodTabs } from "../PeriodTabs";
import { TodayCard } from "../TodayCard";

// Başlıqda həmişə BU GÜNÜN hesabatı + seçilmiş dövrün (gün / həftə / ay) yanacaq pulu ayrıca
export function FuelTop({ car, employeeId, anchor, today, period, range, monthR, atEnd, todayRow, total, month, balance, price, fuelName, onPeriod, onShift }: FuelTopProps) {
  return (
    // Tünd başlıq sürüşmədə yerində qalır (istifadəçi istəyi): üst zolağın altına yapışır, üstündəki boşluğu fon örtür; aşağı hissə sürüşür
    <div className="lg:sticky lg:top-[var(--header-h)] lg:z-20 lg:-mx-2 lg:-mt-[var(--gap)] lg:bg-bg lg:px-2 lg:pb-1 lg:pt-[var(--gap)]">
      <section className="rounded-[18px] bg-[#0c1b36] bg-[radial-gradient(520px_220px_at_100%_0%,rgba(34,195,230,0.22),transparent_70%)] p-5 text-white max-sm:p-3">
        <div className="flex flex-wrap items-center gap-x-6 gap-y-3 max-sm:gap-y-2">
          <CarInfo car={car} employeeId={employeeId} anchor={anchor} price={price} fuelName={fuelName} />
          <PeriodTabs period={period} label={range.label} atEnd={atEnd} onPeriod={onPeriod} onShift={onShift} />
        </div>
        <div className="mt-4 grid gap-3 max-sm:mt-2 max-sm:gap-2 sm:grid-cols-2 lg:grid-cols-[1.35fr_1fr]">
          <TodayCard today={today} row={todayRow} />
          <PeriodCard period={period} range={range} monthR={monthR} total={total} month={month} balance={balance} />
        </div>
      </section>
    </div>
  );
}
