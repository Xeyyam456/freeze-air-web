// Excel üçün tarix köməkçiləri (ISO gün "YYYY-MM-DD"; günorta UTC: saat qurşağı günü sürüşdürməsin)
export const d12 = (iso: string) => new Date(`${iso}T12:00:00Z`);
const isoOf = (d: Date) => d.toISOString().slice(0, 10);
export const addDays = (iso: string, n: number) => { const d = d12(iso); d.setUTCDate(d.getUTCDate() + n); return isoOf(d); };
export const dow = (iso: string) => d12(iso).getUTCDay();
export const ddmm = (iso: string) => `${iso.slice(8)}.${iso.slice(5, 7)}`;
export const ddmmyyyy = (iso: string) => `${iso.slice(8)}.${iso.slice(5, 7)}.${iso.slice(0, 4)}`;
export const asDate = (iso: string) => { const [y, m, d] = iso.split("-").map(Number); return new Date(Date.UTC(y, m - 1, d)); };
export const round2 = (n: number) => Math.round(n * 100) / 100;
