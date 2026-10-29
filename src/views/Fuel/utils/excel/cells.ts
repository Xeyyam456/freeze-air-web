import type { ExcelTotals } from "@/types/myFuel";
import { round2 } from "./dates";
import { AZN, AZN_SIGNED, border, head, INK, INT, LITER, MUTED, OK, SOFT, toneOf, ZEBRA } from "./style";

export const emptyTotals = (): ExcelTotals => ({ km: 0, liters: 0, cost: 0, paid: 0, days: 0 });

// Sətrin əsası: tək sətirlər zebra, nazik haşiyə
export const rowBase = (i: number, height = 24) => ({ alignVertical: "center" as const, height, ...(i % 2 ? { backgroundColor: ZEBRA } : {}), ...border });
export const numCell = <B extends object>(base: B, v: number, format: string, color = INK, bold = false) =>
  ({ ...base, value: v, type: Number, format, align: "right" as const, textColor: color, ...(bold ? { fontWeight: "bold" as const } : {}) });
export const totalBase = { alignVertical: "center" as const, height: 26, fontWeight: "bold" as const, backgroundColor: SOFT, ...border };

// Eyni sütunlu sətir (Günlük, Həftəlik və Aylıq hesabat blokları üçün): 3 mətn + km, litr, sərf, alınan, fərq
export const rowOf = (first: string, second: string, third: string, t: ExcelTotals, i: number) => {
  const diff = round2(t.paid - t.cost);
  const base = rowBase(i);
  return [
    { ...base, value: first, fontWeight: "bold" as const }, { ...base, value: second, align: "center" as const, textColor: MUTED }, { ...base, value: third, align: "center" as const },
    numCell(base, t.km, INT, INK, true), numCell(base, round2(t.liters), LITER), numCell(base, round2(t.cost), AZN, INK, true), numCell(base, round2(t.paid), AZN, OK, true), numCell(base, diff, AZN_SIGNED, toneOf(diff), true),
  ];
};
export const tableHead = (a: string, b: string, c: string) => [head(a, "left"), head(b), head(c), head("Km", "right"), head("Litr", "right"), head("Sərf", "right"), head("Alınan", "right"), head("Fərq (alınan − sərf)", "right")];

// Xülasə kartları: üstdə kiçik ad, altda iri rəqəm (hər kart 2 sütun)
export const kpi = (labelText: string, value: number | string, fmt: string | undefined, color: string, colSpan = 2) => ({
  labelText, cell: { value, ...(typeof value === "number" ? { type: Number, format: fmt } : {}), columnSpan: colSpan, fontWeight: "bold" as const, fontSize: 18, textColor: color, align: "center" as const, alignVertical: "center" as const, height: 34, backgroundColor: "#ffffff", ...border },
});
export const kpiRow = (items: ReturnType<typeof kpi>[]) => [
  items.flatMap((k) => [{ value: k.labelText, columnSpan: 2, fontSize: 10, fontWeight: "bold" as const, textColor: MUTED, align: "center" as const, alignVertical: "center" as const, height: 20, backgroundColor: "#f8fafc", ...border }, null]),
  items.flatMap((k) => [k.cell, null]),
];
