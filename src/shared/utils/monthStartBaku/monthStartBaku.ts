// Bakı vaxtı ilə bu ayın ilk günü "YYYY-MM-01"
export function monthStartBaku() {
  const today = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Baku" }).format(new Date());
  return `${today.slice(0, 8)}01`;
}
