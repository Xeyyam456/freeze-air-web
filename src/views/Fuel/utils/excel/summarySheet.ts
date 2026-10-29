import type { FuelExcelCtx } from "@/types/myFuel";
import { kpi, kpiRow, tableHead, totalBase } from "./cells";
import { ddmm, round2 } from "./dates";
import { AMBER, AZN, AZN_SIGNED, blank, INT, LITER, MUTED, NAVY, OK, section, span, sub, title } from "./style";
import { calcBlock, dayBlock, monthBlock, weekTable } from "./summaryBlocks";

const C1 = 8;

// 1) Xülasə: balans zolağı, göstəricilər, günlük → həftəlik → aylıq hesabat, dəqiq hesablama
export function summarySheet(c: FuelExcelCtx) {
  const { T, days, workdaysAll, balance, bal, waiting, dayT } = c;
  const weeks = weekTable(c);
  const k1 = kpiRow([kpi("CƏMİ KM", T.km, INT, NAVY), kpi("CƏMİ LİTR", round2(T.liters), LITER, NAVY), kpi("SƏRF (ŞİRKƏT ÖDƏYƏN)", T.cost, AZN, NAVY), kpi("ALDIĞIN PUL", T.paid, AZN, OK)]);
  const k2 = kpiRow([
    kpi("YÜRÜŞ YAZILAN GÜN", `${T.days} / ${workdaysAll}`, undefined, NAVY),
    kpi("SON GÜNÜN SƏRFİ", round2(dayT.cost), AZN, NAVY),
    kpi("SON HƏFTƏNİN SƏRFİ", round2(weeks.last?.cost ?? 0), AZN, NAVY),
    kpi("AYIN BALANSI", balance, AZN_SIGNED, bal.color),
  ]);
  return [
    title(C1, `Freeze Air Service — Yanacaq hesabı: ${c.label}`),
    sub(C1, c.carLine),
    sub(C1, `Balans = alınan − sərf (hər ayın öz hesabı).   ${c.made}`),
    span(C1, bal.text, { fontWeight: "bold", fontSize: 14, textColor: bal.color, backgroundColor: bal.bg, alignVertical: "center", height: 34, indent: 1 }),
    ...(waiting > 0 ? [span(C1, `Təsdiq gözləyən / mübahisəli ödəniş: ${waiting.toFixed(2)} ₼ (yuxarıdakı alınan məbləğə daxildir)`, { fontSize: 10, textColor: AMBER, alignVertical: "center", height: 20, indent: 1 })] : []),
    blank(C1),
    ...k1, blank(C1), ...k2, blank(C1),
    ...dayBlock(c),
    section(C1, "Həftəlik hesabat (bazar ertəsi – bazar)"),
    tableHead("Həftə", "Tarix aralığı", "Yürüş günü"),
    ...weeks.rows,
    [
      { ...totalBase, value: "Ay cəmi" }, { ...totalBase, value: `${ddmm(days[0])} – ${ddmm(days[days.length - 1])}`, align: "center" as const, textColor: MUTED },
      { ...totalBase, value: `${T.days} / ${workdaysAll}`, align: "center" as const },
      { ...totalBase, value: T.km, type: Number, format: INT, align: "right" as const },
      { ...totalBase, value: round2(T.liters), type: Number, format: LITER, align: "right" as const },
      { ...totalBase, value: T.cost, type: Number, format: AZN, align: "right" as const },
      { ...totalBase, value: T.paid, type: Number, format: AZN, align: "right" as const, textColor: OK },
      { ...totalBase, value: balance, type: Number, format: AZN_SIGNED, align: "right" as const, textColor: bal.color },
    ],
    blank(C1),
    ...monthBlock(c),
    ...calcBlock(c),
  ];
}
