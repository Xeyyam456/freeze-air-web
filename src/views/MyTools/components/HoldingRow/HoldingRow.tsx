import { Package, Undo2, Wrench, X } from "lucide-react";
import { ConfirmButton } from "@/components/ConfirmButton";
import { createClient } from "@/lib/supabase/client";
import { rpc } from "@/services/myTools/rpc";
import { Button } from "@/shared/components/Button";
import type { Tone } from "@/types/depot";
import type { Mine, MyToolsView } from "@/types/myTools";
import { SOFT } from "@/views/Depot/constants/tones";
import { dateAz, daysSince } from "@/views/Depot/utils/dates";
import { fmt } from "@/views/Depot/utils/quantity";
import { StatusDot } from "../StatusDot";

// "Məndə olanlar" sətri: seç qutusu, ad + nə vaxtdan, miqdar, vəziyyət, Qaytar / Geri götür
export function HoldingRow({ h, v }: { h: Mine; v: MyToolsView }) {
  const t = h.tools!;
  const material = t.kind === "material";
  const ret = v.pendingReturn.get(h.id);
  const d = daysSince(h.taken_at);
  const st: { tone: Tone; label: string } = !h.received_at ? (h.disputed_at ? { tone: "red", label: "«Almadım» dedin" } : { tone: "amber", label: "Təsdiqlə ↑" })
    : ret ? { tone: "violet", label: "Qaytarma gözləyir" } : { tone: "green", label: "Məndədir" };
  return (
    <li className={`flex flex-wrap items-center gap-x-3 gap-y-1.5 px-4 py-3 max-sm:py-2 transition-colors sm:px-5 ${v.selected.has(h.id) ? "bg-primary-soft/40" : "hover:bg-[#f7f9fd]"}`}>
      <input type="checkbox" checked={v.selected.has(h.id)} disabled={!v.returnable(h)} onChange={() => v.toggle(h.id)} aria-label={`${t.name}: seç`}
        className="h-4 w-4 shrink-0 accent-[var(--color-primary)] disabled:opacity-30" />
      <span className={`grid h-9 w-9 max-sm:h-8 max-sm:w-8 shrink-0 place-items-center rounded-lg ${material ? SOFT.teal : SOFT.blue}`}>{material ? <Package size={16} /> : <Wrench size={16} />}</span>
      <span className="min-w-0 flex-[1_1_160px]">
        <b className="line-clamp-2 text-sm font-semibold">{t.name}</b>
        <span className="muted block text-xs">götürmüşəm {dateAz(h.taken_at)} · {d === 0 ? "bu gün" : `${d} gün`}</span>
      </span>
      <span className="shrink-0 text-right tabular-nums"><b className="text-[15px]">{fmt(h.quantity)}</b> <span className="text-xs text-muted">{material ? t.unit : "ədəd"}</span></span>
      {/* İkinci hissə: dar yerdə alt sətirdə, sağa yığılır */}
      <span className="ml-auto flex shrink-0 items-center gap-2">
        <StatusDot tone={st.tone} label={st.label} />
        {ret ? (
          <ConfirmButton onConfirm={async () => { await rpc(() => createClient().rpc("depot_request_cancel", { p_id: ret.id }), "Sorğu ləğv edildi"); }} success={false}
            className="btn btn-cancel btn-sm !h-8" title="Sorğunu geri götür" question="Qaytarma sorğusu ləğv olunacaq." confirmLabel="Bəli">
            <X size={14} /> Geri götür
          </ConfirmButton>
        ) : v.returnable(h) && (
          <Button variant="secondary" size="sm" onClick={() => v.setReturning([h])} className="!h-8"><Undo2 size={14} /> Qaytar</Button>
        )}
      </span>
    </li>
  );
}
