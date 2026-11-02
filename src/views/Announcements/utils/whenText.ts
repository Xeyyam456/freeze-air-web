// "bu gün 21:53", "dünən 09:10", "28.10 14:05" (Bakı vaxtı)
const day = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Baku" });
const time = new Intl.DateTimeFormat("az", { timeZone: "Asia/Baku", hour: "2-digit", minute: "2-digit", hour12: false });

export function whenText(iso: string, now = new Date()) {
  const d = new Date(iso);
  const diff = Math.round((Date.parse(day.format(now)) - Date.parse(day.format(d))) / 86_400_000);
  const [, m, dd] = day.format(d).split("-");
  const label = diff === 0 ? "bu gün" : diff === 1 ? "dünən" : `${dd}.${m}`;
  return `${label} ${time.format(d)}`;
}
