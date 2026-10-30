import { MONTHS_AZ } from "@/shared/utils/monthsAz";
import { todayBaku } from "@/shared/utils/todayBaku";
import { fetchFuelYear } from "@/services/myFuel/fetchFuelYear";
import type { ExcelBalance, ExcelTotals, FuelExcelCtx } from "@/types/myFuel";
import { emptyTotals } from "./cells";
import { addDays, ddmmyyyy, dow, round2 } from "./dates";
import { AMBER, FUEL_LABEL, OK, RED } from "./style";

// Ayın hesabı: günlər (bu günə qədər), yekunlar, balans (alınan − sərf), başlıq sətirləri. Məlumat yoxdursa xəta mətni qaytarır
export async function buildFuelCtx(employeeId: number, month: string): Promise<FuelExcelCtx | string> {
  const year = month.slice(0, 4);
  const m = Number(month.slice(5, 7));
  const { emp, logs, pays } = await fetchFuelYear(employeeId, year);
  const name = emp?.full_name ?? "Usta";
  const today = todayBaku();

  // Ayın günləri (bu günə qədər)
  const first = `${month}-01`;
  const lastDay = m === 12 ? `${year}-12-31` : addDays(`${year}-${String(m + 1).padStart(2, "0")}-01`, -1);
  const days: string[] = [];
  for (let d = first; d <= lastDay; d = addDays(d, 1)) if (d <= today) days.push(d);
  if (days.length === 0) return "Bu ay üçün hələ məlumat yoxdur.";
  const monthLogs = logs.filter((l) => l.day.startsWith(month)).sort((a, b) => a.day.localeCompare(b.day));
  const monthPays = pays.filter((p) => p.day.startsWith(month));
  if (monthLogs.length === 0 && monthPays.length === 0) return "Bu ay üçün yürüş və ödəniş yoxdur.";

  const paidOn = (day: string) => round2(monthPays.filter((p) => p.day === day).reduce((n, p) => n + p.amount, 0));
  let workdaysAll = 0;
  for (let d = first; d <= lastDay; d = addDays(d, 1)) if (dow(d) !== 0) workdaysAll++;

  // Ay yekunu
  const T = emptyTotals();
  for (const l of monthLogs) if (l.km !== null) { T.km += l.km; T.liters += l.liters ?? 0; T.cost += l.cost ?? 0; T.days += 1; }
  T.paid = round2(monthPays.reduce((n, p) => n + p.amount, 0));
  T.cost = round2(T.cost);
  const balance = round2(T.paid - T.cost);
  const bal: ExcelBalance = balance < 0
    ? { text: `Şirkət sənə ${(-balance).toFixed(2)} ₼ borcludur`, color: RED, bg: "#fee2e2" }
    : balance > 0
      ? { text: `${balance.toFixed(2)} ₼ artıq almısan`, color: AMBER, bg: "#fff6e5" }
      : { text: "Hesab bağlıdır: alınan və sərf bərabərdir", color: OK, bg: "#dcfce7" };
  const car = [emp?.car_plate, emp?.car_model].filter(Boolean).join(" ");
  const lastPrice = [...monthLogs].reverse().find((l) => l.fuel_price != null)?.fuel_price ?? null;
  const carLine = `Usta: ${name}   ·   Maşın: ${car || "—"}   ·   ${emp?.fuel_type ? FUEL_LABEL[emp.fuel_type] ?? emp.fuel_type : "yanacaq növü yoxdur"}`
    + `   ·   ${emp?.fuel_per_100 ?? "—"} L / 100 km   ·   ${lastPrice ?? "—"} ₼ / L`;

  // Günlük hesabat: yürüşü bağlanmış son gün
  const lastLog = [...monthLogs].reverse().find((l) => l.km !== null);
  const dayT: ExcelTotals = lastLog ? { km: lastLog.km ?? 0, liters: lastLog.liters ?? 0, cost: lastLog.cost ?? 0, paid: paidOn(lastLog.day), days: 1 } : emptyTotals();

  return {
    employeeId, month, year, m, today, name, emp, logs, pays, days, first, lastDay, monthLogs, monthPays, paidOn, workdaysAll, T, balance, bal, car, carLine, lastLog, dayT,
    logOf: new Map(monthLogs.map((l) => [l.day, l])),
    waiting: round2(monthPays.filter((p) => p.status !== "received").reduce((n, p) => n + p.amount, 0)),
    label: `${MONTHS_AZ[m - 1]} ${year}`,
    made: `Hazırlanıb: ${ddmmyyyy(today)}`,
  };
}
