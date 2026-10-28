import { norm } from "@/shared/utils/norm";
import type { Mine, MineData, MyToolsState } from "@/types/myTools";

// Alətlərim: təsdiqlənməli olanlar, gözləyən sorğular, alət / material siyahısı (axtarışla), qaytarıla bilənlər
export function deriveMine(data: MineData, s: MyToolsState) {
  const toConfirm = data.holds.filter((h) => !h.received_at);
  const pendingReturn = new Map(data.requests.filter((r) => r.type === "return" && r.status === "pending").map((r) => [r.assignment_id, r]));
  const pendingReq = data.requests.filter((r) => r.status === "pending");
  const tools = data.holds.filter((h) => h.tools?.kind !== "material");
  const materials = data.holds.filter((h) => h.tools?.kind === "material");
  const list = (s.tab === "tool" ? tools : materials).filter((h) => norm(h.tools?.name).includes(norm(s.query.trim())));
  // Qaytarmaq olar: «Aldım» deyilib və qaytarma sorğusu gözləmir
  const returnable = (h: Mine) => !!h.received_at && !pendingReturn.has(h.id);
  const selectable = list.filter(returnable);
  const chosen = data.holds.filter((h) => s.selected.has(h.id) && returnable(h));
  const allOn = selectable.length > 0 && selectable.every((h) => s.selected.has(h.id));
  return { toConfirm, pendingReturn, pendingReq, tools, materials, list, returnable, selectable, chosen, allOn };
}
