import { CalendarDays } from "lucide-react";
import type { DailySectionProps } from "@/types/myFuel";
import { PERIOD_LABEL } from "../../shared/period";
import { DailyFooter } from "../DailyFooter";
import { DailyRow } from "../DailyRow";

// Günlük hesab: dövrün günləri (km zolağı, sərf, alınan) və yekun
export function DailySection({ rows, payments, total, paid, period, range, today }: DailySectionProps) {
  const maxKm = Math.max(1, ...rows.map((r) => r.km ?? 0));
  return (
    <section>
      <h2 className="mb-3 flex flex-wrap items-center gap-x-2 text-base font-bold">
        <CalendarDays size={18} className="text-primary" /> Günlük hesab
        <span className="text-sm font-semibold text-muted">· {PERIOD_LABEL[period].toLowerCase()}: {range.label}</span>
      </h2>
      {rows.length === 0 ? (
        <p className="card muted py-8 text-center text-sm">Bu dövrdə yürüş yazılmayıb.</p>
      ) : (
        <div className="card overflow-hidden !p-0">
          <div className="flex items-center justify-between border-b border-line bg-[#f8fafc] px-4 py-2 text-[11px] font-semibold uppercase tracking-wider text-muted max-sm:px-3">
            <span>Gün və yürüş</span><span>Sərf · alınan</span>
          </div>
          <ul className="divide-y divide-line">
            {rows.map((r) => (
              <DailyRow key={r.id} r={r} maxKm={maxKm} today={today}
                got={payments.filter((p) => p.day === r.day).reduce((n, p) => n + Number(p.amount), 0)} />
            ))}
          </ul>
          <DailyFooter total={total} paid={paid} range={range} />
        </div>
      )}
    </section>
  );
}
