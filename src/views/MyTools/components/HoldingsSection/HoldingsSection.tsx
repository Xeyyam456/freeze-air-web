import { Package, Search, Undo2, Wrench } from "lucide-react";
import { Button } from "@/shared/components/Button";
import { Input } from "@/shared/components/Input";
import type { HoldingsSectionProps } from "@/types/myTools";
import { HoldingRow } from "../HoldingRow";

// "Məndə olanlar": axtarış, Alətlər | Materiallar tabı, "Hamısını seç" + "Seçilənləri qaytar", sətirlər
export function HoldingsSection({ v }: HoldingsSectionProps) {
  const { tab, query, list, selectable, allOn } = v;
  return (
    <section className="rounded-3xl border border-line bg-surface">
      <div className="flex flex-wrap items-center gap-3 p-4 max-sm:gap-2 max-sm:p-3 sm:p-5">
        <div className="min-w-0 flex-1">
          <h2 className="text-lg font-bold leading-tight max-sm:text-base">Məndə olanlar</h2>
          <p className="muted text-[13px] max-sm:hidden">İşarələ və birdən qaytar, ya da sətirdə «Qaytar»</p>
        </div>
        {v.chosen.length > 0 && (
          <Button onClick={() => v.setReturning(v.chosen)} className="!h-10 max-sm:!h-9 max-sm:w-full"><Undo2 size={16} /> Seçilənləri qaytar ({v.chosen.length})</Button>
        )}
        <label className="relative w-full sm:w-64">
          <Search size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
          <Input value={query} onChange={(e) => v.setQuery(e.target.value)} placeholder="Axtar..." aria-label="Axtar" className="!h-10 !rounded-xl !pl-10 !text-sm max-sm:!h-9" />
        </label>
      </div>
      <div className="flex gap-1 border-t border-line px-3 sm:px-4" role="tablist" aria-label="Növ">
        {([["tool", "Alətlər", v.tools.length, Wrench], ["material", "Materiallar", v.materials.length, Package]] as const).map(([k, l, n, Icon]) => (
          <button key={k} type="button" role="tab" aria-selected={tab === k} onClick={() => v.setTab(k)}
            className={`-mb-px inline-flex h-12 max-sm:h-10 items-center gap-2 border-b-2 px-3 text-sm font-semibold transition-colors ${tab === k ? "border-primary text-primary" : "border-transparent text-muted hover:text-ink"}`}>
            <Icon size={16} /> {l}
            <span className={`rounded-full px-1.5 text-[11px] font-bold ${tab === k ? "bg-primary-soft text-primary" : "bg-bg text-muted"}`}>{n}</span>
          </button>
        ))}
      </div>
      {list.length === 0 ? (
        <p className="muted border-t border-line py-10 text-center text-sm">{query ? "Heç nə tapılmadı." : tab === "tool" ? "Üzərində alət yoxdur." : "Üzərində material yoxdur."}</p>
      ) : (
        // Sətirlər (cədvəl deyil): dar yerdə (mobil, "Kimdə nə var"ın yanında) vəziyyət və düymə ikinci sətrə keçir, yana daşmır
        <div className="border-t border-line">
          <label className="flex items-center gap-3 border-b border-line bg-[#f8fafc] px-4 py-2.5 max-sm:py-1.5 text-xs font-semibold text-muted sm:px-5">
            <input type="checkbox" checked={allOn} disabled={!selectable.length} aria-label="Hamısını seç"
              onChange={() => v.setSelected((s) => { const n = new Set(s); for (const h of selectable) { if (allOn) n.delete(h.id); else n.add(h.id); } return n; })}
              className="h-4 w-4 accent-[var(--color-primary)]" />
            Hamısını seç {selectable.length < list.length && <span className="font-normal">(təsdiqlənməyən və qaytarılan seçilmir)</span>}
          </label>
          <ul className="divide-y divide-line">
            {list.map((h) => <HoldingRow key={h.id} h={h} v={v} />)}
          </ul>
        </div>
      )}
    </section>
  );
}
