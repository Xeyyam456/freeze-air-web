import type { FuelExcelCtx } from "@/types/myFuel";
import { rowBase, totalBase } from "./cells";
import { asDate, round2 } from "./dates";
import { AZN, blank, BLUE, border, head, INK, MUTED, PAY_STATUS, SOFT, span, sub, title } from "./style";

const C3 = 4;

// 3) Ödənişlər: şirkətin verdiyi pullar və ustanın cavabı (Aldım / Təsdiq gözləyir / Almadım)
export function paymentsSheet({ monthPays, T, label, name, made }: FuelExcelCtx) {
  const sumBy = (st: string) => round2(monthPays.filter((p) => p.status === st).reduce((n, p) => n + p.amount, 0));
  const rows = monthPays.map((p, i) => {
    const st = PAY_STATUS[p.status] ?? PAY_STATUS.pending;
    const base = rowBase(i, 22);
    return [
      { ...base, value: asDate(p.day), type: Date, format: "dd.mm.yyyy", align: "center" as const },
      { ...base, value: p.amount, type: Number, format: AZN, align: "right" as const, fontWeight: "bold" as const },
      { ...base, value: st.v, align: "center" as const, fontWeight: "bold" as const, textColor: st.color, backgroundColor: st.bg },
      { ...base, value: p.note ?? "", wrap: true, textColor: p.note ? INK : MUTED },
    ];
  });
  return [
    title(C3, `Şirkətin verdiyi yanacaq pulu: ${label}`),
    sub(C3, `${name}   ·   ${made}`),
    span(C3, `Aldım: ${sumBy("received").toFixed(2)} ₼    Təsdiq gözləyir: ${sumBy("pending").toFixed(2)} ₼    Almadım: ${sumBy("disputed").toFixed(2)} ₼`, { fontWeight: "bold", textColor: BLUE, backgroundColor: SOFT, alignVertical: "center", height: 26, indent: 1 }),
    blank(C3),
    [head("Tarix"), head("Məbləğ", "right"), head("Vəziyyət"), head("Qeyd", "left")],
    ...(rows.length ? rows : [span(C3, "Bu ayda şirkət yanacaq pulu verməyib.", { textColor: MUTED, align: "center", height: 26, ...border })]),
    ...(rows.length ? [[
      { ...totalBase, value: `Cəmi (${monthPays.length})` },
      { ...totalBase, value: T.paid, type: Number, format: AZN, align: "right" as const },
      { ...totalBase, value: "" }, { ...totalBase, value: "" },
    ]] : []),
  ];
}
