import { MapPin, Trophy } from "lucide-react";
import type { TopPlacesProps } from "@/types/myWork";

// Ən çox işlənən yerlər: top 5, qradiyent zolaq
export function TopPlaces({ top }: TopPlacesProps) {
  const maxPlace = top[0]?.n ?? 1;
  return (
    <section className="card !border-transparent !bg-[#0c1b36] text-white">
      <h3 className="card-title mb-4 flex items-center gap-2 !text-white"><Trophy size={18} className="text-frost" /> Ən çox işlənən yerlər</h3>
      {top.length === 0 ? (
        <p className="py-8 text-center text-sm text-white/60">Bu ayda iş qeydi yoxdur.</p>
      ) : (
        <ul className="space-y-4">
          {top.map((p, i) => (
            <li key={p.label}>
              <div className="flex items-center gap-3">
                <span className={`grid h-7 w-7 shrink-0 place-items-center rounded-lg text-xs font-extrabold ${i === 0 ? "bg-gradient-to-br from-primary to-frost text-white shadow-[0_4px_10px_rgba(31,111,235,0.35)]" : "bg-white/10 text-white/70"}`}>{i + 1}</span>
                <span className="flex min-w-0 flex-1 items-center gap-1.5 text-sm font-semibold"><MapPin size={13} className="shrink-0 text-frost" /><span className="truncate" title={p.label}>{p.label}</span></span>
                <span className="shrink-0 text-sm font-extrabold tabular-nums">{p.n}<span className="text-xs font-semibold text-white/55"> iş</span></span>
              </div>
              <div className="ml-10 mt-2 h-2 overflow-hidden rounded-full bg-white/10">
                <div className="h-full rounded-full bg-gradient-to-r from-primary to-frost" style={{ width: `${(p.n / maxPlace) * 100}%` }} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
