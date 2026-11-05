import { norm } from "@/shared/utils/norm";
import type { ErrorCode } from "@/types/errorCodes";
import { isCodeQuery } from "./isCodeQuery";

// Axtarışa uyğun kodların id-ləri; null: hamısı adi görünür (boş axtarış və ya tam 2 simvollu kod — o özü seçilir)
export function matchCodes(codes: ErrorCode[], query: string): Set<number> | null {
  const q = query.trim();
  if (!q) return null;
  if (isCodeQuery(q)) {
    if (q.length === 2) return null;
    const up = q.toUpperCase();
    return new Set(codes.filter((c) => c.code.startsWith(up)).map((c) => c.id));
  }
  const words = norm(q).split(/\s+/).filter(Boolean);
  return new Set(codes.filter((c) => {
    const hay = norm(`${c.code} ${c.title} ${c.solution ?? ""}`);
    return words.every((w) => hay.includes(w));
  }).map((c) => c.id));
}
