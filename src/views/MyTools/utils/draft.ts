import { fmt, isPacked, parseQty, pieceWord, round2 } from "@/views/Depot/utils/quantity";
import type { Mine } from "@/types/myTools/Mine";
import type { Draft } from "@/types/myTools/Draft";

// Qaytarılan bir şeyin yazılışı: alətdə say; materialda "qaytarıram X (kq | balon)" + "qalanı: işlətdim | məndə qalır"

export const emptyDraft = (h: Mine): Draft => ({ qty: String(h.quantity), ret: "", byPack: false, restUsed: true });

export function calc(h: Mine, d: Draft) {
  const t = h.tools!;
  if (t.kind !== "material") {
    const q = parseQty(d.qty);
    const ok = Number.isInteger(q) && q >= 1 && q <= h.quantity;
    return { ok, over: q > h.quantity, quantity: q, used: 0, returned: 0, hint: ok ? `${q} ədəd qaytarılır` : `1 ilə ${h.quantity} arası yaz` };
  }
  const typed = parseQty(d.ret);
  const ret = round2((Number.isNaN(typed) ? 0 : typed) * (isPacked(t) && d.byPack ? t.pack_size : 1));
  const rest = round2(h.quantity - ret);
  const used = d.restUsed ? Math.max(0, rest) : 0;
  const over = rest < 0;
  const openPart = isPacked(t) ? round2(ret - Math.floor(round2(ret / t.pack_size)) * t.pack_size) : 0;
  const hint = over ? "Səndə olandan çox ola bilməz" : [
    used > 0 && `işlətdim ${fmt(used)} ${t.unit}`,
    ret > 0 && `qaytarıram ${fmt(ret)} ${t.unit}${openPart > 0 ? ` (${fmt(openPart)} ${t.unit} ${pieceWord(t)})` : ""}`,
    !d.restUsed && rest > 0 && `məndə qalır ${fmt(rest)} ${t.unit}`,
  ].filter(Boolean).join(" · ") || "nə qədər qaytardığını yaz";
  return { ok: !over && (ret > 0 || used > 0), over, quantity: 0, used, returned: ret, hint };
}
