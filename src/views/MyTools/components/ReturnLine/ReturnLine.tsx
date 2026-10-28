import { Package, Wrench } from "lucide-react";
import { useLoggedUse } from "@/views/Depot/hooks/useLoggedUse";
import { SOFT } from "@/views/Depot/constants/tones";
import { fmt, isPacked, showQty } from "@/views/Depot/utils/quantity";
import type { Mine } from "@/types/myTools/Mine";
import type { Draft } from "@/types/myTools/Draft";
import { calc } from "@/views/MyTools/utils/draft";
import { Seg } from "@/views/MyTools/components/Seg";

// Toplu qaytarma pəncərəsinin bir sətri
export function ReturnLine({ h, d, onChange, employeeId }: { h: Mine; d: Draft; onChange: (d: Draft) => void; employeeId: number }) {
  const t = h.tools!;
  const material = t.kind === "material";
  const c = calc(h, d);
  const logged = useLoggedUse(employeeId, h.tool_id, h.taken_at, material);
  return (
    <li className="py-3">
      <div className="flex items-center gap-3">
        <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl ${material ? SOFT.teal : SOFT.blue}`}>{material ? <Package size={16} /> : <Wrench size={16} />}</span>
        <span className="min-w-0 flex-1">
          <b className="block truncate text-sm font-semibold">{t.name}</b>
          <span className="muted block text-xs">səndə {showQty(h.quantity, material ? t.unit : "ədəd", t)}{logged ? ` · iş qeydlərində ${fmt(logged)} ${t.unit}` : ""}</span>
        </span>
        {!material && (
          <span className="flex items-center gap-1.5">
            <input value={d.qty} onChange={(e) => onChange({ ...d, qty: e.target.value })} inputMode="numeric" aria-label={`${t.name}: say`}
              className={`field !h-9 !w-16 !px-2 text-center !text-sm ${c.over ? "!border-danger" : ""}`} />
            <span className="muted text-xs">ədəd</span>
          </span>
        )}
      </div>
      {material && (
        <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2 rounded-xl bg-bg p-2.5 max-sm:p-2 sm:ml-12">
          {/* İki qrup, hər biri bölünmür: dar ekranda alt-alta düşür */}
          <span className="flex flex-wrap items-center gap-2">
            <span className="w-16 text-xs font-semibold">Qaytarıram</span>
            <input value={d.ret} onChange={(e) => onChange({ ...d, ret: e.target.value })} inputMode="decimal" placeholder="0" aria-label={`${t.name}: qaytarıram`}
              className={`field !h-8 !w-16 !px-2 !text-[13px] ${c.over ? "!border-danger" : ""}`} />
            {isPacked(t) ? <Seg value={d.byPack} onChange={(v) => onChange({ ...d, byPack: v })} items={[[false, t.unit], [true, t.pack_name]]} />
              : <span className="muted text-xs">{t.unit}</span>}
          </span>
          <span className="flex items-center gap-2">
            <span className="w-16 text-xs font-semibold">Qalanı</span>
            <Seg value={d.restUsed} onChange={(v) => onChange({ ...d, restUsed: v })} items={[[true, "işlətdim"], [false, "məndə qalır"]]} />
          </span>
        </div>
      )}
      <p className={`mt-1.5 text-xs sm:ml-12 ${c.over ? "font-semibold text-danger" : "muted"}`}>{c.hint}</p>
    </li>
  );
}
