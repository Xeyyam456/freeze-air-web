// Server komponentlərində də işləyir: shared/hooks/useMonthAttendance.ts React hook-ları daşıyır, ona görə buradan import olunmur
const MONTHS = ["Yanvar", "Fevral", "Mart", "Aprel", "May", "İyun", "İyul", "Avqust", "Sentyabr", "Oktyabr", "Noyabr", "Dekabr"];

// Bakı vaxtı ilə bu ayın ilk günü "YYYY-MM-01"
export function monthStartBaku() {
  const today = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Baku" }).format(new Date());
  return `${today.slice(0, 8)}01`;
}

// "2026-10-07" → "7 Oktyabr"
export function shortDateAz(iso: string) {
  return `${Number(iso.slice(8, 10))} ${MONTHS[Number(iso.slice(5, 7)) - 1]}`;
}

// Koordinatı olan filial/mağazaların faizi
export function coordPercent(withCoords: number, total: number) {
  return total ? Math.round((withCoords / total) * 100) : 0;
}
