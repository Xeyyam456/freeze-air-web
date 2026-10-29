import { toast } from "@/lib/toast";
import { buildFuelCtx } from "./context";
import { dailySheet } from "./dailySheet";
import { paymentsSheet } from "./paymentsSheet";
import { summarySheet } from "./summarySheet";
import { yearSheet } from "./yearSheet";

// Yanacaq hesabının Excel ixracı (write-excel-file 4.1.1; "Davamiyyət" ixracı ilə eyni üslub: tünd başlıq, mavi cədvəl başlığı, zebra).
// Hər usta öz hesabını çıxarır: 4 vərəq: 1) Xülasə (balans, göstəricilər, həftəlik hesab), 2) Gündəlik (hər gün: km, litr, sərf, alınan,
// günün fərqi, yığılmış balans, km zolağı), 3) Ödənişlər (şirkətin verdiyi pullar və vəziyyəti), 4) Aylar (il üzrə hər ayın hesabı).
// Balans = alınan − sərf: mənfi → şirkət ustaya borcludur, müsbət → artıq alınıb. Balans aylıqdır (hər ayın öz hesabı); "Aylar"da yığılmış cəm də var.
export async function exportFuel(employeeId: number, month: string) {
  try {
    const c = await buildFuelCtx(employeeId, month);
    if (typeof c === "string") return toast.error(c);
    const write = (await import("write-excel-file/browser")).default;
    await write([
      { data: summarySheet(c), sheet: "Xülasə", columns: [{ width: 16 }, { width: 18 }, { width: 14 }, { width: 14 }, { width: 14 }, { width: 16 }, { width: 16 }, { width: 22 }], showGridLines: false, orientation: "landscape" },
      { data: dailySheet(c), sheet: "Gündəlik", columns: [{ width: 13 }, { width: 18 }, { width: 12 }, { width: 13 }, { width: 13 }, { width: 11 }, { width: 11 }, { width: 13 }, { width: 13 }, { width: 14 }, { width: 16 }, { width: 28 }, { width: 54 }], stickyRowsCount: 5, showGridLines: false, orientation: "landscape" },
      { data: paymentsSheet(c), sheet: "Ödənişlər", columns: [{ width: 13 }, { width: 15 }, { width: 18 }, { width: 46 }], stickyRowsCount: 5, showGridLines: false },
      { data: yearSheet(c), sheet: "Aylar", columns: [{ width: 14 }, { width: 13 }, { width: 13 }, { width: 13 }, { width: 15 }, { width: 15 }, { width: 16 }, { width: 18 }], stickyRowsCount: 5, showGridLines: false },
    ], { fontFamily: "Calibri", fontSize: 11 }).toFile(`yanacaq-${c.name.replace(/\s+/g, "-")}-${month}.xlsx`);
    toast.success("Yanacaq hesabı Excel fayla yazıldı", `${c.label}: ${c.T.days} gün, ${c.T.km} km`);
  } catch (e) {
    toast.error(e instanceof Error ? e.message : "Excel fayl yaradılmadı.");
  }
}
