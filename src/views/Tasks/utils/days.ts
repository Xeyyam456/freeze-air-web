const pad = (n: number) => String(n).padStart(2, "0");
// Yerli tarix "YYYY-MM-DD"
export const iso = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
export function shift(day: string, delta: number) {
  const d = new Date(`${day}T00:00`);
  d.setDate(d.getDate() + delta);
  return iso(d);
}
// Həftə bazar ertəsindən başlayır
export function weekStart(day: string) {
  const d = new Date(`${day}T00:00`);
  return shift(day, -((d.getDay() + 6) % 7));
}
export const WEEKDAYS = ["B.e.", "Ç.a.", "Çər.", "C.a.", "Cüm.", "Şən.", "Baz."];
const MONTHS = ["yanvar", "fevral", "mart", "aprel", "may", "iyun", "iyul", "avqust", "sentyabr", "oktyabr", "noyabr", "dekabr"];

// Həftənin aralığı: "26–1 noyabr" yox, ay dəyişəndə "26 oktyabr – 1 noyabr"
export function weekRange(from: string) {
  const [, fm, fd] = from.split("-").map(Number);
  const [, lm, ld] = shift(from, 6).split("-").map(Number);
  return fm === lm ? `${fd}–${ld} ${MONTHS[fm - 1]}` : `${fd} ${MONTHS[fm - 1]} – ${ld} ${MONTHS[lm - 1]}`;
}
