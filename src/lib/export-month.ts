"use client";

import { createClient } from "@/lib/supabase/client";
import { toast } from "@/lib/toast";

const MONTHS = ["Yanvar", "Fevral", "Mart", "Aprel", "May", "İyun", "İyul", "Avqust", "Sentyabr", "Oktyabr", "Noyabr", "Dekabr"];
const pad = (n: number) => String(n).padStart(2, "0");
const iso = (y: number, m: number, d: number) => `${y}-${pad(m + 1)}-${pad(d)}`;
// Bakı saatı ilə "14:32" (brauzerin saat qurşağından asılı olmasın)
const timeOf = (isoTime: string) =>
  new Intl.DateTimeFormat("az", { timeZone: "Asia/Baku", hour: "2-digit", minute: "2-digit", hour12: false }).format(new Date(isoTime));

// Ustanın seçilmiş ay üzrə öz işləri: rəngli, formatlı .xlsx (admin paneldəki "Görülən işlər" ixracı ilə eyni üslub)
export async function exportMonthXlsx(employeeId: number, y: number, m: number) {
  const supabase = createClient();
  const days = new Date(y, m + 1, 0).getDate();
  const [{ data: logs, error }, { data: emp }] = await Promise.all([
    supabase.from("work_logs")
      .select("id, work_date, created_at, description, place_text, stores(name, code, companies(name)), companies(name)")
      .eq("employee_id", employeeId).gte("work_date", iso(y, m, 1)).lte("work_date", iso(y, m, days))
      .order("work_date").order("created_at"),
    supabase.from("employees").select("full_name").eq("id", employeeId).maybeSingle(),
  ]);
  if (error) return toast.error(error.message);
  const rows = logs ?? [];
  if (rows.length === 0) return toast.error("Bu ayda iş qeydi yoxdur.");

  const place = (l: (typeof rows)[number]) =>
    l.stores ? `${l.stores.companies?.name ?? ""} · ${l.stores.name}` : l.companies ? l.companies.name : l.place_text ?? "—";

  const { default: writeXlsxFile } = await import("write-excel-file/browser");
  const NAVY = "#0a1a33", BLUE = "#1f6feb", LINE = "#d9dfeb", ZEBRA = "#f4f7fc", MUTED = "#667085";
  const cols = 4;
  const span = (value: string, style: Record<string, unknown>) => [{ value, columnSpan: cols, ...style }, ...Array(cols - 1).fill(null)];
  const border = { borderColor: LINE, borderStyle: "thin" as const };
  const head = (value: string, align: "left" | "center" = "left") => ({ value, fontWeight: "bold" as const, textColor: "#ffffff", backgroundColor: BLUE, align, alignVertical: "center" as const, height: 24, ...border });
  const activeDays = new Set(rows.map((l) => l.work_date)).size;
  const places = new Set(rows.map(place)).size;
  const name = emp?.full_name ?? "Usta";

  const data = [
    span(`Freeze Air Service — ${name}: ${MONTHS[m]} ${y} işləri`, { fontWeight: "bold", fontSize: 16, textColor: "#ffffff", backgroundColor: NAVY, alignVertical: "center", height: 34, indent: 1 }),
    span(`Tarix: 01.${pad(m + 1)}.${y} – ${pad(days)}.${pad(m + 1)}.${y}`, { fontSize: 10, textColor: MUTED, alignVertical: "center", height: 20, indent: 1 }),
    span(`İş sayı: ${rows.length}     İş görülən gün: ${activeDays}     Fərqli yer: ${places}`, { fontWeight: "bold", textColor: BLUE, backgroundColor: "#eaf2fe", alignVertical: "center", height: 26, indent: 1 }),
    Array(cols).fill(null),
    [head("Tarix", "center"), head("Saat", "center"), head("İş yeri"), head("Görülən iş")],
    ...rows.map((l, i) => {
      const bg = i % 2 ? { backgroundColor: ZEBRA } : {};
      const [yy, mm, dd] = l.work_date.split("-").map(Number);
      const base = { alignVertical: "top" as const, ...bg, ...border };
      return [
        { ...base, value: new Date(Date.UTC(yy, mm - 1, dd)), type: Date, format: "dd.mm.yyyy", align: "center" as const },
        { ...base, value: timeOf(l.created_at), align: "center" as const, textColor: MUTED },
        { ...base, value: place(l), textColor: BLUE, fontWeight: "bold" as const, wrap: true },
        { ...base, value: l.description ?? "", wrap: true },
      ];
    }),
    [{ value: "Cəmi", columnSpan: 3, fontWeight: "bold" as const, align: "right" as const, backgroundColor: "#eaf2fe", ...border }, null, null, { value: `${rows.length} iş`, fontWeight: "bold" as const, textColor: BLUE, backgroundColor: "#eaf2fe", ...border }],
  ];

  await writeXlsxFile(data, {
    sheet: `${MONTHS[m]} ${y}`,
    columns: [{ width: 13 }, { width: 8 }, { width: 38 }, { width: 70 }],
    stickyRowsCount: 5,
    showGridLines: false,
    orientation: "landscape",
  }, { fontFamily: "Calibri", fontSize: 11 }).toFile(`islerim-${y}-${pad(m + 1)}.xlsx`);
  toast.success(`${rows.length} iş Excel fayla yazıldı`);
}
