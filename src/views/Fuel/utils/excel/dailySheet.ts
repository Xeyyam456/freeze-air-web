import type { FuelExcelCtx } from "@/types/myFuel";
import { totalBase } from "./cells";
import { asDate, dow, round2 } from "./dates";
import { AMBER, AZN, AZN_SIGNED, blank, BLUE, border, head, INK, INT, LITER, MUTED, OK, sub, title, toneOf, WEEKDAY, ZEBRA } from "./style";

const C2 = 13;

// 2) Gündəlik: hər gün km, litr, qiymət, sərf, alınan, günün fərqi, yığılmış balans, km zolağı, hesablama
export function dailySheet({ days, monthLogs, logOf, paidOn, T, balance, bal, label, carLine, made, emp }: FuelExcelCtx) {
  const maxKm = Math.max(1, ...monthLogs.map((l) => l.km ?? 0));
  let cum = 0;
  const rows = days.map((d, i) => {
    const l = logOf.get(d);
    const got = paidOn(d);
    const diff = round2(got - (l?.cost ?? 0));
    cum = round2(cum + diff);
    const sunday = dow(d) === 0;
    const shade = sunday ? { backgroundColor: "#f1f5f9" } : i % 2 ? { backgroundColor: ZEBRA } : {};
    const base = { alignVertical: "center" as const, height: 22, ...shade, ...border };
    const open = !!l && l.end_km === null;
    const num = (v: number | null, format: string, color = INK, bold = false) => v === null
      ? { ...base, value: "—", align: "center" as const, textColor: MUTED }
      : { ...base, value: v, type: Number, format, align: "right" as const, textColor: color, ...(bold ? { fontWeight: "bold" as const } : {}) };
    const bar = l?.km ? "█".repeat(Math.max(1, Math.round((l.km / maxKm) * 22))) : "";
    return [
      { ...base, value: asDate(d), type: Date, format: "dd.mm.yyyy", align: "center" as const },
      { ...base, value: WEEKDAY[dow(d)], textColor: sunday ? "#64748b" : INK },
      num(l ? l.start_km : null, INT),
      open ? { ...base, value: "yazılmayıb", align: "center" as const, textColor: AMBER, fontWeight: "bold" as const } : num(l?.end_km ?? null, INT),
      num(l?.km ?? null, INT, INK, true),
      num(l?.liters ?? null, LITER),
      num(l?.fuel_price ?? null, '0.00 "₼"'),
      num(l?.cost ?? null, AZN, INK, true),
      got ? num(got, AZN, OK, true) : { ...base, value: "—", align: "center" as const, textColor: MUTED },
      l || got ? num(diff, AZN_SIGNED, toneOf(diff)) : { ...base, value: "", align: "center" as const },
      l || got ? num(cum, AZN_SIGNED, toneOf(cum), true) : { ...base, value: "", align: "center" as const },
      { ...base, value: bar, textColor: BLUE, fontSize: 9 },
      { ...base, value: l && l.km !== null && l.fuel_per_100 != null && l.fuel_price != null ? `${l.km} km × ${l.fuel_per_100} L/100 km = ${(l.km * l.fuel_per_100 / 100).toFixed(2)} L × ${l.fuel_price} ₼ = ${(l.cost ?? 0).toFixed(2)} ₼` : "", textColor: MUTED, fontSize: 10 },
    ];
  });
  return [
    title(C2, `Gündəlik yanacaq hesabı: ${label}`),
    sub(C2, `${carLine}   ·   ${made}`),
    sub(C2, "Fərq = o gün alınan − o gün sərf (mənfi: şirkət borcludur).   Yığılmış balans ayın əvvəlindən cəmlənir.   Bazar günləri boz."),
    blank(C2),
    [head("Tarix"), head("Həftənin günü", "left"), head("Səhər km", "right"), head("Axşam km", "right"), head("Gedilən km", "right"), head("Litr", "right"), head("Qiymət (L)", "right"),
      head("Sərf", "right"), head("Alınan", "right"), head("Günün fərqi", "right"), head("Yığılmış balans", "right"), head("Km zolağı", "left"), head("Hesablama", "left")],
    ...rows,
    [
      { ...totalBase, value: "Ay cəmi", columnSpan: 2 }, null,
      { ...totalBase, value: "" }, { ...totalBase, value: "" },
      { ...totalBase, value: T.km, type: Number, format: INT, align: "right" as const },
      { ...totalBase, value: round2(T.liters), type: Number, format: LITER, align: "right" as const },
      { ...totalBase, value: "" },
      { ...totalBase, value: T.cost, type: Number, format: AZN, align: "right" as const },
      { ...totalBase, value: T.paid, type: Number, format: AZN, align: "right" as const, textColor: OK },
      { ...totalBase, value: balance, type: Number, format: AZN_SIGNED, align: "right" as const, textColor: bal.color },
      { ...totalBase, value: balance, type: Number, format: AZN_SIGNED, align: "right" as const, textColor: bal.color },
      { ...totalBase, value: "" }, { ...totalBase, value: `${T.km} km × ${emp?.fuel_per_100 ?? "—"} ÷ 100 = ${round2(T.liters).toFixed(2)} L`, textColor: MUTED, fontSize: 10 },
    ],
  ];
}
