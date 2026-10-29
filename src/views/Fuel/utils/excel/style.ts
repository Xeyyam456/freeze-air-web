// Yanacaq Excel-inin üslubu ("Davamiyyət" ixracı ilə eyni: tünd başlıq, mavi cədvəl başlığı, zebra)
export const NAVY = "#0a1a33", BLUE = "#1f6feb", LINE = "#d9dfeb", ZEBRA = "#f4f7fc", MUTED = "#667085", SOFT = "#eaf2fe";
export const OK = "#16a34a", RED = "#dc2626", AMBER = "#b45309", INK = "#111827";
export const WEEKDAY = ["Bazar", "Bazar ertəsi", "Çərşənbə axşamı", "Çərşənbə", "Cümə axşamı", "Cümə", "Şənbə"];
export const AZN = '#,##0.00 "₼"';
export const AZN_SIGNED = '+#,##0.00 "₼";-#,##0.00 "₼";0.00 "₼"';
export const INT = "#,##0";
export const LITER = '#,##0.0 "L"';

export const FUEL_LABEL: Record<string, string> = { petrol: "Benzin", diesel: "Dizel" };
export const PAY_STATUS: Record<string, { v: string; color: string; bg: string }> = {
  received: { v: "Aldım", color: OK, bg: "#dcfce7" },
  disputed: { v: "Almadım", color: RED, bg: "#fee2e2" },
  pending: { v: "Təsdiq gözləyir", color: AMBER, bg: "#fff6e5" },
};
// Fərqin rəngi: mənfi (borc) qırmızı, müsbət (artıq) kəhrəba, sıfır yaşıl
export const toneOf = (v: number) => (v < 0 ? RED : v > 0 ? AMBER : OK);

export const border = { borderColor: LINE, borderStyle: "thin" as const };
export const head = (value: string, align: "left" | "center" | "right" = "center") =>
  ({ value, fontWeight: "bold" as const, textColor: "#ffffff", backgroundColor: BLUE, align, alignVertical: "center" as const, height: 32, wrap: true, ...border });
export const span = (cols: number, value: string, style: Record<string, unknown>) => [{ value, columnSpan: cols, ...style }, ...Array(cols - 1).fill(null)];
export const title = (cols: number, value: string) => span(cols, value, { fontWeight: "bold", fontSize: 16, textColor: "#ffffff", backgroundColor: NAVY, alignVertical: "center", height: 36, indent: 1 });
export const sub = (cols: number, value: string) => span(cols, value, { fontSize: 10, textColor: MUTED, alignVertical: "center", height: 20, indent: 1 });
export const section = (cols: number, value: string) => span(cols, value, { fontWeight: "bold", fontSize: 12, textColor: NAVY, backgroundColor: SOFT, alignVertical: "center", height: 26, indent: 1 });
export const blank = (cols: number) => Array(cols).fill(null);
