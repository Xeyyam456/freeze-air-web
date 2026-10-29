import { MONTHS_AZ } from "@/lib/attendance";
import type { ExcelTotals, FuelExcelCtx } from "@/types/myFuel";
import { emptyTotals, rowOf, tableHead } from "./cells";
import { addDays, ddmm, ddmmyyyy, dow, round2 } from "./dates";
import { blank, INK, section, span, WEEKDAY } from "./style";

const C1 = 8;

// Həftəlik hesab (bazar ertəsi → bazar; ayla kəsilir): sətirlər və son həftənin cəmi
export function weekTable({ days, logOf, paidOn }: FuelExcelCtx) {
  const weeks = new Map<string, string[]>();
  for (const d of days) {
    const ws = addDays(d, -((dow(d) + 6) % 7));
    weeks.set(ws, [...(weeks.get(ws) ?? []), d]);
  }
  let last: ExcelTotals | undefined;
  const rows = [...weeks.values()].map((ds, i) => {
    const t = emptyTotals();
    for (const d of ds) {
      const l = logOf.get(d);
      if (l && l.km !== null) { t.km += l.km; t.liters += l.liters ?? 0; t.cost += l.cost ?? 0; t.days += 1; }
      t.paid += paidOn(d);
    }
    t.cost = round2(t.cost); t.paid = round2(t.paid);
    last = t;
    return rowOf(`${i + 1}-ci həftə`, `${ddmm(ds[0])} – ${ddmm(ds[ds.length - 1])}`, `${t.days} / ${ds.filter((d) => dow(d) !== 0).length}`, t, i);
  });
  return { rows, last };
}

// Günlük hesabat: yürüşü bağlanmış son gün
export const dayBlock = ({ lastLog, dayT }: FuelExcelCtx) => lastLog
  ? [section(C1, `Günlük hesabat: ${WEEKDAY[dow(lastLog.day)]}, ${ddmmyyyy(lastLog.day)} (yürüşü bağlanmış son gün)`),
    tableHead("Gün", "Tarix", "Spidometr"), rowOf(WEEKDAY[dow(lastLog.day)], ddmmyyyy(lastLog.day), `${lastLog.start_km.toLocaleString("az")} → ${(lastLog.end_km ?? 0).toLocaleString("az")}`, dayT, 0), blank(C1)]
  : [];

// Aylıq hesabat: seçilmiş ay və (varsa) əvvəlki ay
export function monthBlock({ logs, pays, m, year, label, days, T, workdaysAll }: FuelExcelCtx) {
  const prevPrefix = m > 1 ? `${year}-${String(m - 1).padStart(2, "0")}` : null;
  const prevT = prevPrefix ? emptyTotals() : null;
  if (prevT) {
    for (const l of logs) if (l.day.startsWith(prevPrefix!) && l.km !== null) { prevT.km += l.km; prevT.liters += l.liters ?? 0; prevT.cost += l.cost ?? 0; prevT.days += 1; }
    for (const p of pays) if (p.day.startsWith(prevPrefix!)) prevT.paid += p.amount;
  }
  return [
    section(C1, "Aylıq hesabat"),
    tableHead("Ay", "Dövr", "Yürüş günü"),
    rowOf(`${label} (bu ay)`, `${ddmm(days[0])} – ${ddmm(days[days.length - 1])}`, `${T.days} / ${workdaysAll}`, T, 0),
    ...(prevT && (prevT.days || prevT.paid) ? [rowOf(`${MONTHS_AZ[m - 2]} ${year}`, "tam ay", `${prevT.days}`, prevT, 1)] : []),
    blank(C1),
  ];
}

// Dəqiq hesablama: rəqəmlərin hansı düsturla çıxdığı
export function calcBlock({ emp, monthPays, lastLog, T, waiting, balance, bal }: FuelExcelCtx) {
  const per100 = emp?.fuel_per_100 ?? null;
  const receivedSum = round2(monthPays.filter((p) => p.status === "received").reduce((n, p) => n + p.amount, 0));
  const calcLine = (v: string) => span(C1, v, { fontSize: 11, textColor: INK, alignVertical: "center", height: 22, indent: 1, wrap: true });
  const exLog = lastLog && lastLog.km !== null && lastLog.fuel_per_100 != null && lastLog.fuel_price != null ? lastLog : null;
  return [
    section(C1, "Dəqiq hesablama (rəqəmlər necə çıxır)"),
    calcLine(per100 != null
      ? `Litr = km × sərf ÷ 100  →  ${T.km} × ${per100} ÷ 100 = ${(T.km * per100 / 100).toFixed(2)} L   (ay üzrə hər günün litri cəmlənib: ${round2(T.liters).toFixed(2)} L)`
      : `Litr: ayın cəmi ${round2(T.liters).toFixed(2)} L (100 km-ə sərf yazılmayıb)`),
    calcLine(exLog
      ? `Sərf = hər gün üçün (km × sərf ÷ 100 × həmin günün qiyməti), sonra cəmlənir.   Məsələn ${ddmmyyyy(exLog.day)}: ${exLog.km} × ${exLog.fuel_per_100} ÷ 100 = ${(exLog.km! * exLog.fuel_per_100! / 100).toFixed(2)} L × ${exLog.fuel_price} ₼ = ${(exLog.cost ?? 0).toFixed(2)} ₼`
      : "Sərf = hər gün üçün (km × sərf ÷ 100 × həmin günün qiyməti), sonra cəmlənir."),
    calcLine(`Ay üzrə sərf cəmi = ${T.cost.toFixed(2)} ₼   (${T.days} gün, ${T.km} km, ${round2(T.liters).toFixed(2)} L)`),
    calcLine(`Alınan = ${monthPays.length} ödənişin cəmi = ${T.paid.toFixed(2)} ₼   (təsdiqlənmiş ${receivedSum.toFixed(2)} ₼ · gözləyən/mübahisəli ${waiting.toFixed(2)} ₼)`),
    calcLine(`Balans = alınan − sərf = ${T.paid.toFixed(2)} − ${T.cost.toFixed(2)} = ${balance.toFixed(2)} ₼   →   ${bal.text}`),
  ];
}
