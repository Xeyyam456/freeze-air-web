"use client";

import type { FuelLogProps } from "@/types/myFuel";
import { DailySection } from "./components/DailySection";
import { FuelTop } from "./components/FuelTop";
import { PaymentsSection } from "./components/PaymentsSection";
import { SetupWarning } from "./components/SetupWarning";
import { TodaySection } from "./components/TodaySection";
import { useFuelLog } from "./hooks/useFuelLog";

// Yanacaq: bu günün səhər / axşam km-i (şəkil + rəqəm), avtomatik km, litr, məbləğ (0077-0079).
// Başlıqda həmişə BU GÜNÜN hesabatı + seçilmiş dövrün (gün / həftə / ay) yanacaq pulu ayrıca; cədvəl dövrə görə (admin ilə eyni).
// Yetki (yalnız maşını olan usta) app/(panel)/yanacaq/page.tsx-də serverdə yoxlanır. Bu səhifə web-ə məxsusdur.
export function FuelLog({ employeeId, car }: FuelLogProps) {
  const f = useFuelLog(employeeId, car);
  return (
    <div className="space-y-6">
      <FuelTop car={car} employeeId={employeeId} anchor={f.anchor} today={f.today} period={f.period} range={f.range} monthR={f.monthR} atEnd={f.atEnd}
        todayRow={f.todayRow} total={f.total} month={f.month} balance={f.balance} price={f.price} fuelName={f.fuelName}
        onPeriod={f.choosePeriod} onShift={f.shift} />
      <SetupWarning per100={car.fuel_per_100} price={f.price} fuelName={f.fuelName} />
      <TodaySection loading={f.data === null} row={f.todayRow} onSave={f.save} />
      {f.data && <PaymentsSection label={f.range.label} payments={f.payments} onConfirm={f.confirm} />}
      {f.rows && <DailySection rows={f.rows} payments={f.payments} total={f.total} paid={f.paid} period={f.period} range={f.range} today={f.today} />}
    </div>
  );
}
