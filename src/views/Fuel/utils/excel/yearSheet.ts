import { MONTHS_AZ } from "@/shared/utils/monthsAz";
import type { FuelExcelCtx } from "@/types/myFuel";
import { emptyTotals, totalBase } from "./cells";
import { round2 } from "./dates";
import { AZN, AZN_SIGNED, blank, border, head, INK, INT, LITER, MUTED, OK, SOFT, sub, title, toneOf, ZEBRA } from "./style";

const C4 = 8;

// 4) Aylar (il): hər ayın hesabı, ayın balansı və ilin əvvəlindən yığılmış balans
export function yearSheet({ logs, pays, year, month, today, name, car, made }: FuelExcelCtx) {
  let acc = 0;
  const yearTotals = emptyTotals();
  const rows = Array.from({ length: 12 }, (_, i) => {
    const prefix = `${year}-${String(i + 1).padStart(2, "0")}`;
    const t = emptyTotals();
    for (const l of logs) if (l.day.startsWith(prefix) && l.km !== null) { t.km += l.km; t.liters += l.liters ?? 0; t.cost += l.cost ?? 0; t.days += 1; }
    for (const p of pays) if (p.day.startsWith(prefix)) t.paid += p.amount;
    t.cost = round2(t.cost); t.paid = round2(t.paid);
    const future = prefix > today.slice(0, 7);
    const empty = t.days === 0 && t.paid === 0;
    const diff = round2(t.paid - t.cost);
    if (!future) acc = round2(acc + diff);
    yearTotals.km += t.km; yearTotals.liters += t.liters; yearTotals.cost += t.cost; yearTotals.paid += t.paid; yearTotals.days += t.days;
    const base = { alignVertical: "center" as const, height: 24, ...(prefix === month ? { backgroundColor: SOFT } : i % 2 ? { backgroundColor: ZEBRA } : {}), ...border };
    const dash = { ...base, value: "—", align: "center" as const, textColor: MUTED };
    const num = (v: number, format: string, color = INK, bold = false) => (future || empty) ? dash : { ...base, value: v, type: Number, format, align: "right" as const, textColor: color, ...(bold ? { fontWeight: "bold" as const } : {}) };
    return [
      { ...base, value: MONTHS_AZ[i], fontWeight: "bold" as const, textColor: future ? MUTED : INK },
      (future || empty) ? dash : { ...base, value: t.days, type: Number, align: "center" as const },
      num(t.km, INT, INK, true), num(round2(t.liters), LITER), num(t.cost, AZN, INK, true), num(t.paid, AZN, OK, true),
      num(diff, AZN_SIGNED, toneOf(diff), true),
      future ? dash : { ...base, value: acc, type: Number, format: AZN_SIGNED, align: "right" as const, textColor: toneOf(acc), fontWeight: "bold" as const },
    ];
  });
  const yearDiff = round2(yearTotals.paid - yearTotals.cost);
  return [
    title(C4, `${year}-ci il: aylar üzrə yanacaq hesabı`),
    sub(C4, `${name}   ·   ${car || "—"}   ·   ${made}`),
    sub(C4, "Ayın balansı = o ayda alınan − o ayda sərf.   Yığılmış balans ilin əvvəlindən aylar üzrə cəmlənir (mənfi: şirkət borcludur)."),
    blank(C4),
    [head("Ay", "left"), head("Yürüş günü"), head("Km", "right"), head("Litr", "right"), head("Sərf", "right"), head("Alınan", "right"), head("Ayın balansı", "right"), head("Yığılmış balans", "right")],
    ...rows,
    [
      { ...totalBase, value: `${year} cəmi` }, { ...totalBase, value: yearTotals.days, type: Number, align: "center" as const },
      { ...totalBase, value: yearTotals.km, type: Number, format: INT, align: "right" as const },
      { ...totalBase, value: round2(yearTotals.liters), type: Number, format: LITER, align: "right" as const },
      { ...totalBase, value: round2(yearTotals.cost), type: Number, format: AZN, align: "right" as const },
      { ...totalBase, value: round2(yearTotals.paid), type: Number, format: AZN, align: "right" as const, textColor: OK },
      { ...totalBase, value: yearDiff, type: Number, format: AZN_SIGNED, align: "right" as const, textColor: toneOf(yearDiff) },
      { ...totalBase, value: acc, type: Number, format: AZN_SIGNED, align: "right" as const, textColor: toneOf(acc) },
    ],
  ];
}
