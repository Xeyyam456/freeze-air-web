import type { WorkDraft } from "@/types/myWork";

// Material miqdarı kəsr ola bilər (0085: 2,5 kq): "2,5" və "2.5" ikisi də olur
export const toNum = (s: string | undefined) => Math.round((Number(String(s ?? "").trim().replace(",", ".")) || 0) * 100) / 100;
export const fmtNum = (n: number) => String(Math.round(n * 100) / 100).replace(".", ",");

export function today() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

// Yeni işin qaralaması (yalnız bu brauzerdə): obyektdə internet kəsiləndə və ya pəncərə təsadüfən bağlananda yazılan itməsin.
// Fayllar saxlanmır (brauzer icazə vermir). Uğurla yazılanda silinir.
const draftKey = (employeeId: number) => `worklog-draft:${employeeId}`;
export function readDraft(employeeId: number): WorkDraft | null {
  try {
    const raw = localStorage.getItem(draftKey(employeeId));
    return raw ? (JSON.parse(raw) as WorkDraft) : null;
  } catch {
    return null;
  }
}
export function writeDraft(employeeId: number, d: WorkDraft | null) {
  try {
    if (d) localStorage.setItem(draftKey(employeeId), JSON.stringify(d));
    else localStorage.removeItem(draftKey(employeeId));
  } catch {
    // brauzer yaddaşı bağlıdır: qaralama sadəcə saxlanmır
  }
}
