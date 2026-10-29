import { useMemo, useState } from "react";
import { todayBaku } from "@/lib/attendance";
import type { Period } from "@/types/fuel";
import type { FuelCarInfo } from "@/types/myFuel";
import { useMyFuelData, useMyFuelReload } from "../queries/useMyFuelData";
import { addDays, addMonths } from "../shared/dates";
import { FUEL_LABEL } from "../shared/fuelTypes";
import { sum } from "../shared/money";
import { rangeOf } from "../shared/rangeOf";
import { useFuelActions } from "./useFuelActions";
import { useFuelLive } from "./useFuelLive";

// Səhifənin vəziyyəti: dövr (gün / həftə / ay) və tarixi, məlumat, hesablanan yekunlar, canlı yeniləmə, yazı əməliyyatları
export function useFuelLog(employeeId: number, car: FuelCarInfo) {
  const today = todayBaku();
  const [period, setPeriod] = useState<Period>("day");
  const [anchor, setAnchor] = useState(today);
  const range = rangeOf(period, anchor);
  const monthR = rangeOf("month", anchor); // balansın ayı
  const data = useMyFuelData(employeeId, range.from, range.to, today, monthR.from, monthR.to);
  const load = useMyFuelReload();
  useFuelLive(employeeId, load);

  const prices = data?.prices ?? { petrol: null, diesel: null };
  // Maşının yanacaq növünün hazırkı qiyməti
  const price = car.fuel_type === "diesel" ? prices.diesel : car.fuel_type === "petrol" ? prices.petrol : null;
  const fuelName = car.fuel_type ? FUEL_LABEL[car.fuel_type] : null;
  const todayRow = data?.today ?? null;
  const rows = data?.rows ?? null;
  const total = useMemo(() => sum(rows ?? []), [rows]);
  const payments = data?.payments ?? [];
  const paid = payments.reduce((n, p) => n + Number(p.amount), 0);
  // Ayın balansı: gün / həftə seçilsə də ayın borcuna görə (300 ₼ ayda verilibsə günə baxanda "artıq almısan" yazılmır)
  const month = data?.month ?? { cost: 0, paid: 0 };
  const { save, confirm } = useFuelActions(employeeId, today, todayRow, load);

  const shift = (dir: 1 | -1) => setAnchor((x) => {
    const next = period === "day" ? addDays(x, dir) : period === "week" ? addDays(x, 7 * dir) : addMonths(x, dir);
    return next > today ? today : next;
  });

  return {
    today, period, anchor, range, monthR, data, price, fuelName, todayRow, rows, total, payments, paid, month, save, confirm, shift,
    balance: month.paid - month.cost,
    atEnd: range.to >= today,
    choosePeriod: (p: Period) => { setPeriod(p); setAnchor(today); },
  };
}
