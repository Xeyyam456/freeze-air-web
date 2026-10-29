import { Download, Table2 } from "lucide-react";
import type { HeroControlsProps } from "@/types/myWork";

const seg = (on: boolean) => `rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${on ? "bg-white text-primary shadow-sm" : "text-white/80 hover:text-white"}`;

// Rejim (Günlük | Yığım), Excel ixracı və Qrafik/Cədvəl keçidi
export function HeroControls({ cumulative, onCumulative, table, onTable, canExport, exporting, onExport }: HeroControlsProps) {
  return (
    <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
      <div className="inline-flex gap-0.5 rounded-xl bg-white/15 p-1 max-sm:w-full max-sm:[&>button]:flex-1" role="tablist" aria-label="Rejim">
        <button type="button" role="tab" aria-selected={!cumulative} onClick={() => onCumulative(false)} className={seg(!cumulative)}>Günlük</button>
        <button type="button" role="tab" aria-selected={cumulative} onClick={() => onCumulative(true)} className={seg(cumulative)}>Yığım</button>
      </div>
      <div className="flex items-center gap-2 max-sm:w-full max-sm:[&>button]:flex-1 max-sm:[&>button]:justify-center max-sm:[&>button]:py-2">
        <button type="button" disabled={!canExport || exporting} title="Seçilmiş ayın işlərini Excel faylına yaz" onClick={onExport}
          className="inline-flex items-center gap-1.5 rounded-lg bg-white px-3 py-1.5 text-xs font-bold text-primary transition-colors hover:bg-white/90 disabled:opacity-60">
          <Download size={14} /> {exporting ? "Hazırlanır..." : "Excel"}
        </button>
        <button type="button" onClick={onTable} aria-pressed={table}
          className="inline-flex items-center gap-1.5 rounded-lg bg-white/15 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-white/25">
          <Table2 size={14} /> {table ? "Qrafik" : "Cədvəl"}
        </button>
      </div>
    </div>
  );
}
