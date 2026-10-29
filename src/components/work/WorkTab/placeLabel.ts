import type { EmployeeLog } from "@/types/myWork";

// Yer: siyahıda olmayan yer | mağaza/filial (şirkət adı və kodu ilə) | şirkət
export function placeLabel(log: EmployeeLog) {
  if (log.place_text) return log.place_text;
  if (log.stores) return `${log.stores.companies?.name ?? ""} · ${log.stores.code} ${log.stores.name}`;
  return log.companies?.name ?? "Yer silinib";
}

// "14:32" (cihazın vaxtı)
export function timeOf(iso: string) {
  const d = new Date(iso);
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}
