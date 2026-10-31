// "14:32" (Bakı vaxtı)
export function timeOf(iso: string) {
  return new Intl.DateTimeFormat("az", { timeZone: "Asia/Baku", hour: "2-digit", minute: "2-digit", hour12: false }).format(new Date(iso));
}

// "17.10.2026" (Bakı vaxtı)
export function dateOf(iso: string) {
  return new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Baku", day: "2-digit", month: "2-digit", year: "numeric" }).format(new Date(iso)).replaceAll("/", ".");
}
