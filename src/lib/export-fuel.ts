import { MONTHS_AZ, todayBaku } from "@/lib/attendance";
import { createClient } from "@/lib/supabase/client";
import { toast } from "@/lib/toast";

// Yanacaq hesabının Excel ixracı (write-excel-file 4.1.1; "Davamiyyət" ixracı ilə eyni üslub: tünd başlıq, mavi cədvəl başlığı, zebra).
// Hər usta öz hesabını çıxarır: 4 vərəq: 1) Xülasə (balans, göstəricilər, həftəlik hesab), 2) Gündəlik (hər gün: km, litr, sərf, alınan,
// günün fərqi, yığılmış balans, km zolağı), 3) Ödənişlər (şirkətin verdiyi pullar və vəziyyəti), 4) Aylar (il üzrə hər ayın hesabı).
// Balans = alınan − sərf: mənfi → şirkət ustaya borcludur, müsbət → artıq alınıb. Balans aylıqdır (hər ayın öz hesabı); "Aylar"da yığılmış cəm də var.

const NAVY = "#0a1a33", BLUE = "#1f6feb", LINE = "#d9dfeb", ZEBRA = "#f4f7fc", MUTED = "#667085", SOFT = "#eaf2fe";
const OK = "#16a34a", RED = "#dc2626", AMBER = "#b45309", INK = "#111827";
const WEEKDAY = ["Bazar", "Bazar ertəsi", "Çərşənbə axşamı", "Çərşənbə", "Cümə axşamı", "Cümə", "Şənbə"];
const AZN = '#,##0.00 "₼"';
const AZN_SIGNED = '+#,##0.00 "₼";-#,##0.00 "₼";0.00 "₼"';
const INT = "#,##0";
const LITER = '#,##0.0 "L"';

const border = { borderColor: LINE, borderStyle: "thin" as const };
const head = (value: string, align: "left" | "center" | "right" = "center") =>
  ({ value, fontWeight: "bold" as const, textColor: "#ffffff", backgroundColor: BLUE, align, alignVertical: "center" as const, height: 32, wrap: true, ...border });
const span = (cols: number, value: string, style: Record<string, unknown>) => [{ value, columnSpan: cols, ...style }, ...Array(cols - 1).fill(null)];
const title = (cols: number, value: string) => span(cols, value, { fontWeight: "bold", fontSize: 16, textColor: "#ffffff", backgroundColor: NAVY, alignVertical: "center", height: 36, indent: 1 });
const sub = (cols: number, value: string) => span(cols, value, { fontSize: 10, textColor: MUTED, alignVertical: "center", height: 20, indent: 1 });
const section = (cols: number, value: string) => span(cols, value, { fontWeight: "bold", fontSize: 12, textColor: NAVY, backgroundColor: SOFT, alignVertical: "center", height: 26, indent: 1 });

const d12 = (iso: string) => new Date(`${iso}T12:00:00Z`);
const isoOf = (d: Date) => d.toISOString().slice(0, 10);
const addDays = (iso: string, n: number) => { const d = d12(iso); d.setUTCDate(d.getUTCDate() + n); return isoOf(d); };
const dow = (iso: string) => d12(iso).getUTCDay();
const ddmm = (iso: string) => `${iso.slice(8)}.${iso.slice(5, 7)}`;
const ddmmyyyy = (iso: string) => `${iso.slice(8)}.${iso.slice(5, 7)}.${iso.slice(0, 4)}`;
const asDate = (iso: string) => { const [y, m, d] = iso.split("-").map(Number); return new Date(Date.UTC(y, m - 1, d)); };
const round2 = (n: number) => Math.round(n * 100) / 100;

type Log = { day: string; start_km: number; end_km: number | null; km: number | null; liters: number | null; cost: number | null; fuel_price: number | null; fuel_per_100: number | null };
type Pay = { day: string; amount: number; status: string; note: string | null };

const FUEL_LABEL: Record<string, string> = { petrol: "Benzin", diesel: "Dizel" };
const PAY_STATUS: Record<string, { v: string; color: string; bg: string }> = {
  received: { v: "Aldım", color: OK, bg: "#dcfce7" },
  disputed: { v: "Almadım", color: RED, bg: "#fee2e2" },
  pending: { v: "Təsdiq gözləyir", color: AMBER, bg: "#fff6e5" },
};

async function writer() {
  return (await import("write-excel-file/browser")).default;
}

type Totals = { km: number; liters: number; cost: number; paid: number; days: number };
const emptyTotals = (): Totals => ({ km: 0, liters: 0, cost: 0, paid: 0, days: 0 });

export async function exportFuel(employeeId: number, month: string) {
  try {
    const supabase = createClient();
    const year = month.slice(0, 4);
    const m = Number(month.slice(5, 7));
    const [{ data: emp }, { data: logsAll }, { data: paysAll }] = await Promise.all([
      supabase.from("employees").select("full_name, car_plate, car_model, fuel_per_100, fuel_type").eq("id", employeeId).maybeSingle(),
      supabase.from("mileage_logs").select("day, start_km, end_km, km, liters, cost, fuel_price, fuel_per_100").eq("employee_id", employeeId).gte("day", `${year}-01-01`).lte("day", `${year}-12-31`).order("day"),
      supabase.from("fuel_payments").select("day, amount, status, note").eq("employee_id", employeeId).gte("day", `${year}-01-01`).lte("day", `${year}-12-31`).order("day").order("created_at"),
    ]);
    const logs: Log[] = (logsAll ?? []).map((r) => ({ ...r, liters: r.liters != null ? Number(r.liters) : null, cost: r.cost != null ? Number(r.cost) : null, fuel_price: r.fuel_price != null ? Number(r.fuel_price) : null, fuel_per_100: r.fuel_per_100 != null ? Number(r.fuel_per_100) : null }));
    const pays: Pay[] = (paysAll ?? []).map((p) => ({ ...p, amount: Number(p.amount) }));
    const name = emp?.full_name ?? "Usta";
    const today = todayBaku();

    // Ayın günləri (bu günə qədər)
    const first = `${month}-01`;
    const lastDay = m === 12 ? `${year}-12-31` : addDays(`${year}-${String(m + 1).padStart(2, "0")}-01`, -1);
    const days: string[] = [];
    for (let d = first; d <= lastDay; d = addDays(d, 1)) if (d <= today) days.push(d);
    if (days.length === 0) return toast.error("Bu ay üçün hələ məlumat yoxdur.");
    const monthLogs = logs.filter((l) => l.day.startsWith(month)).sort((a, b) => a.day.localeCompare(b.day));
    const monthPays = pays.filter((p) => p.day.startsWith(month));
    if (monthLogs.length === 0 && monthPays.length === 0) return toast.error("Bu ay üçün yürüş və ödəniş yoxdur.");

    const logOf = new Map(monthLogs.map((l) => [l.day, l]));
    const paidOn = (day: string) => round2(monthPays.filter((p) => p.day === day).reduce((n, p) => n + p.amount, 0));
    const workdaysAll = (() => { let n = 0; for (let d = first; d <= lastDay; d = addDays(d, 1)) if (dow(d) !== 0) n++; return n; })();

    // Ay yekunu
    const T = emptyTotals();
    for (const l of monthLogs) if (l.km !== null) { T.km += l.km; T.liters += l.liters ?? 0; T.cost += l.cost ?? 0; T.days += 1; }
    T.paid = round2(monthPays.reduce((n, p) => n + p.amount, 0));
    T.cost = round2(T.cost);
    const balance = round2(T.paid - T.cost);
    const waiting = round2(monthPays.filter((p) => p.status !== "received").reduce((n, p) => n + p.amount, 0));
    const label = `${MONTHS_AZ[m - 1]} ${year}`;
    const bal = balance < 0
      ? { text: `Şirkət sənə ${(-balance).toFixed(2)} ₼ borcludur`, color: RED, bg: "#fee2e2" }
      : balance > 0
        ? { text: `${balance.toFixed(2)} ₼ artıq almısan`, color: AMBER, bg: "#fff6e5" }
        : { text: "Hesab bağlıdır: alınan və sərf bərabərdir", color: OK, bg: "#dcfce7" };
    const car = [emp?.car_plate, emp?.car_model].filter(Boolean).join(" ");
    const lastPrice = [...monthLogs].reverse().find((l) => l.fuel_price != null)?.fuel_price ?? null;
    const carLine = `Usta: ${name}   ·   Maşın: ${car || "—"}   ·   ${emp?.fuel_type ? FUEL_LABEL[emp.fuel_type] ?? emp.fuel_type : "yanacaq növü yoxdur"}`
      + `   ·   ${emp?.fuel_per_100 ?? "—"} L / 100 km   ·   ${lastPrice ?? "—"} ₼ / L`;
    const made = `Hazırlanıb: ${ddmmyyyy(today)}`;

    // ───────── 1) Xülasə ─────────
    const C1 = 8;
    const kpi = (labelText: string, value: number | string, fmt: string | undefined, color: string, colSpan = 2) => ({
      labelText, cell: { value, ...(typeof value === "number" ? { type: Number, format: fmt } : {}), columnSpan: colSpan, fontWeight: "bold" as const, fontSize: 18, textColor: color, align: "center" as const, alignVertical: "center" as const, height: 34, backgroundColor: "#ffffff", ...border },
    });
    const kpiRow = (items: ReturnType<typeof kpi>[]) => [
      items.flatMap((k) => [{ value: k.labelText, columnSpan: 2, fontSize: 10, fontWeight: "bold" as const, textColor: MUTED, align: "center" as const, alignVertical: "center" as const, height: 20, backgroundColor: "#f8fafc", ...border }, null]),
      items.flatMap((k) => [k.cell, null]),
    ];
    const k1 = kpiRow([kpi("CƏMİ KM", T.km, INT, NAVY), kpi("CƏMİ LİTR", round2(T.liters), LITER, NAVY), kpi("SƏRF (ŞİRKƏT ÖDƏYƏN)", T.cost, AZN, NAVY), kpi("ALDIĞIN PUL", T.paid, AZN, OK)]);

    // Həftəlik hesab (bazar ertəsi → bazar; ayla kəsilir)
    const weeks = new Map<string, string[]>();
    for (const d of days) {
      const ws = addDays(d, -((dow(d) + 6) % 7));
      weeks.set(ws, [...(weeks.get(ws) ?? []), d]);
    }
    let run = 0;
    const weekTotals: Totals[] = [];
    const weekRows = [...weeks.values()].map((ds, i) => {
      const t = emptyTotals();
      for (const d of ds) {
        const l = logOf.get(d);
        if (l && l.km !== null) { t.km += l.km; t.liters += l.liters ?? 0; t.cost += l.cost ?? 0; t.days += 1; }
        t.paid += paidOn(d);
      }
      t.cost = round2(t.cost); t.paid = round2(t.paid);
      const diff = round2(t.paid - t.cost);
      weekTotals.push(t);
      run = round2(run + diff);
      const wd = ds.filter((d) => dow(d) !== 0).length;
      const base = { alignVertical: "center" as const, height: 24, ...(i % 2 ? { backgroundColor: ZEBRA } : {}), ...border };
      const num = (v: number, format: string, color = INK, bold = false) => ({ ...base, value: v, type: Number, format, align: "right" as const, textColor: color, ...(bold ? { fontWeight: "bold" as const } : {}) });
      return [
        { ...base, value: `${i + 1}-ci həftə`, fontWeight: "bold" as const },
        { ...base, value: `${ddmm(ds[0])} – ${ddmm(ds[ds.length - 1])}`, align: "center" as const, textColor: MUTED },
        { ...base, value: `${t.days} / ${wd}`, align: "center" as const },
        num(t.km, INT, INK, true), num(round2(t.liters), LITER), num(t.cost, AZN, INK, true), num(t.paid, AZN, OK, true), num(diff, AZN_SIGNED, diff < 0 ? RED : diff > 0 ? AMBER : OK, true),
      ];
    });
    const totalBase = { alignVertical: "center" as const, height: 26, fontWeight: "bold" as const, backgroundColor: SOFT, ...border };
    // Eyni sütunlu sətir (Günlük və Aylıq hesabat blokları üçün)
    const rowOf = (first: string, second: string, third: string, t: Totals, i: number) => {
      const diff = round2(t.paid - t.cost);
      const base = { alignVertical: "center" as const, height: 24, ...(i % 2 ? { backgroundColor: ZEBRA } : {}), ...border };
      const num = (v: number, format: string, color = INK, bold = false) => ({ ...base, value: v, type: Number, format, align: "right" as const, textColor: color, ...(bold ? { fontWeight: "bold" as const } : {}) });
      return [
        { ...base, value: first, fontWeight: "bold" as const }, { ...base, value: second, align: "center" as const, textColor: MUTED }, { ...base, value: third, align: "center" as const },
        num(t.km, INT, INK, true), num(round2(t.liters), LITER), num(round2(t.cost), AZN, INK, true), num(round2(t.paid), AZN, OK, true), num(diff, AZN_SIGNED, diff < 0 ? RED : diff > 0 ? AMBER : OK, true),
      ];
    };
    const tableHead = (a: string, b: string, c: string) => [head(a, "left"), head(b), head(c), head("Km", "right"), head("Litr", "right"), head("Sərf", "right"), head("Alınan", "right"), head("Fərq (alınan − sərf)", "right")];

    // Günlük hesabat: yürüşü bağlanmış son gün
    const lastLog = [...monthLogs].reverse().find((l) => l.km !== null);
    const dayT: Totals = lastLog ? { km: lastLog.km ?? 0, liters: lastLog.liters ?? 0, cost: lastLog.cost ?? 0, paid: paidOn(lastLog.day), days: 1 } : emptyTotals();
    const dayBlock = lastLog
      ? [section(C1, `Günlük hesabat: ${WEEKDAY[dow(lastLog.day)]}, ${ddmmyyyy(lastLog.day)} (yürüşü bağlanmış son gün)`),
        tableHead("Gün", "Tarix", "Spidometr"), rowOf(WEEKDAY[dow(lastLog.day)], ddmmyyyy(lastLog.day), `${lastLog.start_km.toLocaleString("az")} → ${(lastLog.end_km ?? 0).toLocaleString("az")}`, dayT, 0), Array(C1).fill(null)]
      : [];

    // Aylıq hesabat: seçilmiş ay və (varsa) əvvəlki ay
    const monthTotals = (prefix: string): Totals => {
      const t = emptyTotals();
      for (const l of logs) if (l.day.startsWith(prefix) && l.km !== null) { t.km += l.km; t.liters += l.liters ?? 0; t.cost += l.cost ?? 0; t.days += 1; }
      for (const p of pays) if (p.day.startsWith(prefix)) t.paid += p.amount;
      return t;
    };
    const prevPrefix = m > 1 ? `${year}-${String(m - 1).padStart(2, "0")}` : null;
    const prevT = prevPrefix ? monthTotals(prevPrefix) : null;
    const monthBlock = [
      section(C1, "Aylıq hesabat"),
      tableHead("Ay", "Dövr", "Yürüş günü"),
      rowOf(`${label} (bu ay)`, `${ddmm(days[0])} – ${ddmm(days[days.length - 1])}`, `${T.days} / ${workdaysAll}`, T, 0),
      ...(prevT && (prevT.days || prevT.paid) ? [rowOf(`${MONTHS_AZ[m - 2]} ${year}`, "tam ay", `${prevT.days}`, prevT, 1)] : []),
      Array(C1).fill(null),
    ];

    // Dəqiq hesablama: rəqəmlərin hansı düsturla çıxdığı
    const per100 = emp?.fuel_per_100 ?? null;
    const receivedSum = round2(monthPays.filter((p) => p.status === "received").reduce((n, p) => n + p.amount, 0));
    const calcLine = (v: string) => span(C1, v, { fontSize: 11, textColor: INK, alignVertical: "center", height: 22, indent: 1, wrap: true });
    const exLog = lastLog && lastLog.km !== null && lastLog.fuel_per_100 != null && lastLog.fuel_price != null ? lastLog : null;
    const calcBlock = [
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
    const k2 = kpiRow([
      kpi("YÜRÜŞ YAZILAN GÜN", `${T.days} / ${workdaysAll}`, undefined, NAVY),
      kpi("SON GÜNÜN SƏRFİ", round2(dayT.cost), AZN, NAVY),
      kpi("SON HƏFTƏNİN SƏRFİ", round2(weekTotals[weekTotals.length - 1]?.cost ?? 0), AZN, NAVY),
      kpi("AYIN BALANSI", balance, AZN_SIGNED, bal.color),
    ]);
    const summary = [
      title(C1, `Freeze Air Service — Yanacaq hesabı: ${label}`),
      sub(C1, carLine),
      sub(C1, `Balans = alınan − sərf (hər ayın öz hesabı).   ${made}`),
      span(C1, bal.text, { fontWeight: "bold", fontSize: 14, textColor: bal.color, backgroundColor: bal.bg, alignVertical: "center", height: 34, indent: 1 }),
      ...(waiting > 0 ? [span(C1, `Təsdiq gözləyən / mübahisəli ödəniş: ${waiting.toFixed(2)} ₼ (yuxarıdakı alınan məbləğə daxildir)`, { fontSize: 10, textColor: AMBER, alignVertical: "center", height: 20, indent: 1 })] : []),
      Array(C1).fill(null),
      ...k1, Array(C1).fill(null), ...k2, Array(C1).fill(null),
      ...dayBlock,
      section(C1, "Həftəlik hesabat (bazar ertəsi – bazar)"),
      [head("Həftə", "left"), head("Tarix aralığı"), head("Yürüş günü"), head("Km", "right"), head("Litr", "right"), head("Sərf", "right"), head("Alınan", "right"), head("Fərq (alınan − sərf)", "right")],
      ...weekRows,
      [
        { ...totalBase, value: "Ay cəmi" }, { ...totalBase, value: `${ddmm(days[0])} – ${ddmm(days[days.length - 1])}`, align: "center" as const, textColor: MUTED },
        { ...totalBase, value: `${T.days} / ${workdaysAll}`, align: "center" as const },
        { ...totalBase, value: T.km, type: Number, format: INT, align: "right" as const },
        { ...totalBase, value: round2(T.liters), type: Number, format: LITER, align: "right" as const },
        { ...totalBase, value: T.cost, type: Number, format: AZN, align: "right" as const },
        { ...totalBase, value: T.paid, type: Number, format: AZN, align: "right" as const, textColor: OK },
        { ...totalBase, value: balance, type: Number, format: AZN_SIGNED, align: "right" as const, textColor: bal.color },
      ],
      Array(C1).fill(null),
      ...monthBlock,
      ...calcBlock,
    ];

    // ───────── 2) Gündəlik ─────────
    const C2 = 13;
    const maxKm = Math.max(1, ...monthLogs.map((l) => l.km ?? 0));
    let cum = 0;
    const dayRows = days.map((d, i) => {
      const l = logOf.get(d);
      const got = paidOn(d);
      const cost = l?.cost ?? 0;
      const diff = round2(got - cost);
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
        l || got ? num(diff, AZN_SIGNED, diff < 0 ? RED : diff > 0 ? AMBER : OK) : { ...base, value: "", align: "center" as const },
        l || got ? num(cum, AZN_SIGNED, cum < 0 ? RED : cum > 0 ? AMBER : OK, true) : { ...base, value: "", align: "center" as const },
        { ...base, value: bar, textColor: BLUE, fontSize: 9 },
        { ...base, value: l && l.km !== null && l.fuel_per_100 != null && l.fuel_price != null ? `${l.km} km × ${l.fuel_per_100} L/100 km = ${(l.km * l.fuel_per_100 / 100).toFixed(2)} L × ${l.fuel_price} ₼ = ${(l.cost ?? 0).toFixed(2)} ₼` : "", textColor: MUTED, fontSize: 10 },
      ];
    });
    const dailySheet = [
      title(C2, `Gündəlik yanacaq hesabı: ${label}`),
      sub(C2, `${carLine}   ·   ${made}`),
      sub(C2, "Fərq = o gün alınan − o gün sərf (mənfi: şirkət borcludur).   Yığılmış balans ayın əvvəlindən cəmlənir.   Bazar günləri boz."),
      Array(C2).fill(null),
      [head("Tarix"), head("Həftənin günü", "left"), head("Səhər km", "right"), head("Axşam km", "right"), head("Gedilən km", "right"), head("Litr", "right"), head("Qiymət (L)", "right"),
        head("Sərf", "right"), head("Alınan", "right"), head("Günün fərqi", "right"), head("Yığılmış balans", "right"), head("Km zolağı", "left"), head("Hesablama", "left")],
      ...dayRows,
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
        { ...totalBase, value: "" }, { ...totalBase, value: `${T.km} km × ${per100 ?? "—"} ÷ 100 = ${round2(T.liters).toFixed(2)} L`, textColor: MUTED, fontSize: 10 },
      ],
    ];

    // ───────── 3) Ödənişlər ─────────
    const C3 = 4;
    const sumBy = (st: string) => round2(monthPays.filter((p) => p.status === st).reduce((n, p) => n + p.amount, 0));
    const payRows = monthPays.map((p, i) => {
      const st = PAY_STATUS[p.status] ?? PAY_STATUS.pending;
      const base = { alignVertical: "center" as const, height: 22, ...(i % 2 ? { backgroundColor: ZEBRA } : {}), ...border };
      return [
        { ...base, value: asDate(p.day), type: Date, format: "dd.mm.yyyy", align: "center" as const },
        { ...base, value: p.amount, type: Number, format: AZN, align: "right" as const, fontWeight: "bold" as const },
        { ...base, value: st.v, align: "center" as const, fontWeight: "bold" as const, textColor: st.color, backgroundColor: st.bg },
        { ...base, value: p.note ?? "", wrap: true, textColor: p.note ? INK : MUTED },
      ];
    });
    const paySheet = [
      title(C3, `Şirkətin verdiyi yanacaq pulu: ${label}`),
      sub(C3, `${name}   ·   ${made}`),
      span(C3, `Aldım: ${sumBy("received").toFixed(2)} ₼    Təsdiq gözləyir: ${sumBy("pending").toFixed(2)} ₼    Almadım: ${sumBy("disputed").toFixed(2)} ₼`, { fontWeight: "bold", textColor: BLUE, backgroundColor: SOFT, alignVertical: "center", height: 26, indent: 1 }),
      Array(C3).fill(null),
      [head("Tarix"), head("Məbləğ", "right"), head("Vəziyyət"), head("Qeyd", "left")],
      ...(payRows.length ? payRows : [span(C3, "Bu ayda şirkət yanacaq pulu verməyib.", { textColor: MUTED, align: "center", height: 26, ...border })]),
      ...(payRows.length ? [[
        { ...totalBase, value: `Cəmi (${monthPays.length})` },
        { ...totalBase, value: T.paid, type: Number, format: AZN, align: "right" as const },
        { ...totalBase, value: "" }, { ...totalBase, value: "" },
      ]] : []),
    ];

    // ───────── 4) Aylar (il) ─────────
    const C4 = 8;
    let acc = 0;
    const yearTotals = emptyTotals();
    const monthRows = Array.from({ length: 12 }, (_, i) => {
      const mm = String(i + 1).padStart(2, "0");
      const prefix = `${year}-${mm}`;
      const t = emptyTotals();
      for (const l of logs) if (l.day.startsWith(prefix) && l.km !== null) { t.km += l.km; t.liters += l.liters ?? 0; t.cost += l.cost ?? 0; t.days += 1; }
      for (const p of pays) if (p.day.startsWith(prefix)) t.paid += p.amount;
      t.cost = round2(t.cost); t.paid = round2(t.paid);
      const future = prefix > today.slice(0, 7);
      const empty = t.days === 0 && t.paid === 0;
      const diff = round2(t.paid - t.cost);
      if (!future) acc = round2(acc + diff);
      yearTotals.km += t.km; yearTotals.liters += t.liters; yearTotals.cost += t.cost; yearTotals.paid += t.paid; yearTotals.days += t.days;
      const current = prefix === month;
      const base = { alignVertical: "center" as const, height: 24, ...(current ? { backgroundColor: SOFT } : i % 2 ? { backgroundColor: ZEBRA } : {}), ...border };
      const dash = { ...base, value: "—", align: "center" as const, textColor: MUTED };
      const num = (v: number, format: string, color = INK, bold = false) => (future || empty) ? dash : { ...base, value: v, type: Number, format, align: "right" as const, textColor: color, ...(bold ? { fontWeight: "bold" as const } : {}) };
      return [
        { ...base, value: MONTHS_AZ[i], fontWeight: "bold" as const, textColor: future ? MUTED : INK },
        (future || empty) ? dash : { ...base, value: t.days, type: Number, align: "center" as const },
        num(t.km, INT, INK, true), num(round2(t.liters), LITER), num(t.cost, AZN, INK, true), num(t.paid, AZN, OK, true),
        num(diff, AZN_SIGNED, diff < 0 ? RED : diff > 0 ? AMBER : OK, true),
        future ? dash : { ...base, value: acc, type: Number, format: AZN_SIGNED, align: "right" as const, textColor: acc < 0 ? RED : acc > 0 ? AMBER : OK, fontWeight: "bold" as const },
      ];
    });
    const yearDiff = round2(yearTotals.paid - yearTotals.cost);
    const yearSheet = [
      title(C4, `${year}-ci il: aylar üzrə yanacaq hesabı`),
      sub(C4, `${name}   ·   ${car || "—"}   ·   ${made}`),
      sub(C4, "Ayın balansı = o ayda alınan − o ayda sərf.   Yığılmış balans ilin əvvəlindən aylar üzrə cəmlənir (mənfi: şirkət borcludur)."),
      Array(C4).fill(null),
      [head("Ay", "left"), head("Yürüş günü"), head("Km", "right"), head("Litr", "right"), head("Sərf", "right"), head("Alınan", "right"), head("Ayın balansı", "right"), head("Yığılmış balans", "right")],
      ...monthRows,
      [
        { ...totalBase, value: `${year} cəmi` }, { ...totalBase, value: yearTotals.days, type: Number, align: "center" as const },
        { ...totalBase, value: yearTotals.km, type: Number, format: INT, align: "right" as const },
        { ...totalBase, value: round2(yearTotals.liters), type: Number, format: LITER, align: "right" as const },
        { ...totalBase, value: round2(yearTotals.cost), type: Number, format: AZN, align: "right" as const },
        { ...totalBase, value: round2(yearTotals.paid), type: Number, format: AZN, align: "right" as const, textColor: OK },
        { ...totalBase, value: yearDiff, type: Number, format: AZN_SIGNED, align: "right" as const, textColor: yearDiff < 0 ? RED : yearDiff > 0 ? AMBER : OK },
        { ...totalBase, value: acc, type: Number, format: AZN_SIGNED, align: "right" as const, textColor: acc < 0 ? RED : acc > 0 ? AMBER : OK },
      ],
    ];

    const write = await writer();
    await write([
      { data: summary, sheet: "Xülasə", columns: [{ width: 16 }, { width: 18 }, { width: 14 }, { width: 14 }, { width: 14 }, { width: 16 }, { width: 16 }, { width: 22 }], showGridLines: false, orientation: "landscape" },
      { data: dailySheet, sheet: "Gündəlik", columns: [{ width: 13 }, { width: 18 }, { width: 12 }, { width: 13 }, { width: 13 }, { width: 11 }, { width: 11 }, { width: 13 }, { width: 13 }, { width: 14 }, { width: 16 }, { width: 28 }, { width: 54 }], stickyRowsCount: 5, showGridLines: false, orientation: "landscape" },
      { data: paySheet, sheet: "Ödənişlər", columns: [{ width: 13 }, { width: 15 }, { width: 18 }, { width: 46 }], stickyRowsCount: 5, showGridLines: false },
      { data: yearSheet, sheet: "Aylar", columns: [{ width: 14 }, { width: 13 }, { width: 13 }, { width: 13 }, { width: 15 }, { width: 15 }, { width: 16 }, { width: 18 }], stickyRowsCount: 5, showGridLines: false },
    ], { fontFamily: "Calibri", fontSize: 11 }).toFile(`yanacaq-${name.replace(/\s+/g, "-")}-${month}.xlsx`);
    toast.success("Yanacaq hesabı Excel fayla yazıldı", `${label}: ${T.days} gün, ${T.km} km`);
  } catch (e) {
    toast.error(e instanceof Error ? e.message : "Excel fayl yaradılmadı.");
  }
}
