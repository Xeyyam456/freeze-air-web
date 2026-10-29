import { Package } from "lucide-react";
import type { MaterialsUsedProps } from "@/types/myWork";
import { fmtNum, toNum } from "./draft";

// Üzərimdəki materialdan bu işdə nə qədər işlətdim (istəyə görə): depo məsulu təhvildə görür
export function MaterialsUsed({ held, used, onUse }: MaterialsUsedProps) {
  if (held.length === 0) return null;
  return (
    <div>
      <span className="label">İşlədilən material <span className="muted font-normal">(istəyə görə)</span></span>
      <ul className="divide-y divide-line rounded-xl border border-line">
        {held.map((m) => {
          const over = toNum(used[m.toolId]) > m.quantity;
          return (
            <li key={m.toolId} className="flex items-center gap-3 px-3 py-2 max-sm:gap-2">
              <Package size={15} className="shrink-0 text-primary" />
              <span className="min-w-0 flex-1">
                <span className="line-clamp-2 text-sm font-semibold">{m.name}</span>
                <span className={`block whitespace-nowrap text-[11px] ${over ? "font-semibold text-danger" : "muted"}`}>Məndə: {fmtNum(m.quantity)} {m.unit}</span>
              </span>
              <input inputMode="decimal" autoComplete="off" value={used[m.toolId] ?? ""} placeholder="0"
                onChange={(e) => onUse(m.toolId, e.target.value)}
                className={`field !h-9 !w-20 text-center max-sm:!w-16 max-sm:!px-1 ${over ? "!border-danger" : ""}`} aria-label={`${m.name}: işlədilən miqdar`} />
              <span className="muted w-10 text-xs max-sm:w-auto">{m.unit}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
