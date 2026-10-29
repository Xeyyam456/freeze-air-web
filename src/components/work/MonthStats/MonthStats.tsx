"use client";

import { useState } from "react";
import { CalendarDays } from "lucide-react";
import { exportMonthXlsx } from "@/lib/export-month";
import { useMe } from "@/lib/me";
import { useData } from "@/lib/useData";
import { fetchMonthStats } from "@/services/myWork/monthStats";
import { DaysTable } from "./DaysTable";
import { Heatmap } from "./Heatmap";
import { HeroChart } from "./HeroChart";
import { HeroControls } from "./HeroControls";
import { HeroTop } from "./HeroTop";
import { TopPlaces } from "./TopPlaces";
import { useMonthSummary } from "./useMonthSummary";

// Aylıq statistika (usta paneli): öz işlərim. Parlaq mavi hero kart (iri rəqəm + əyri), kalendar istilik xəritəsi, ən çox işlənən yerlər.
export function MonthStats() {
  const [today] = useState(() => { const t = new Date(); return { y: t.getFullYear(), m: t.getMonth(), d: t.getDate() }; });
  const [ym, setYm] = useState({ y: today.y, m: today.m });
  const meCard = useMe(); // undefined = yüklənir, null = əməkdaş kartı yoxdur
  const me = meCard === null ? null : meCard?.id;
  // Keşdə: ay dəyişəndə köhnə ay yeni gələnə qədər qalır (data.key ilə ayırd edilir); iş yazılanda QueryProvider yeniləyir
  const data = useData("month-stats", () => (me ? fetchMonthStats(me, ym.y, ym.m) : Promise.resolve(null)), [me, ym.y, ym.m]);
  const [cumulative, setCumulative] = useState(false);
  const [table, setTable] = useState(false);
  const [exporting, setExporting] = useState(false);
  const days = new Date(ym.y, ym.m + 1, 0).getDate();
  const isCurrent = ym.y === today.y && ym.m === today.m;
  const stats = useMonthSummary(data, days);

  if (me === null) {
    return <div className="card muted py-10 text-center text-sm">Hesabın əməkdaş kartına bağlı deyil, ona görə şəxsi statistika yoxdur.</div>;
  }
  const loading = me === undefined || !data || data.key !== `${ym.y}-${ym.m}`;

  return (
    <div className="space-y-5">
      {/* Yenilənəndə çərçivə qalır, məzmun solğunlaşır (skelet və tullanma yox) */}
      <div className={`space-y-5 transition-opacity ${loading && data ? "opacity-60" : ""}`}>
        {/* Hero: parlaq mavi→firuzəyi kart */}
        <section className="relative overflow-hidden rounded-[22px] bg-[linear-gradient(135deg,#091428,#0f2447_60%,#123a6a)] p-6 text-white max-sm:p-4 shadow-[0_20px_50px_rgba(9,20,40,0.35)]">
          <div className="pointer-events-none absolute -right-16 -top-20 h-64 w-64 rounded-full bg-frost/20 blur-3xl" aria-hidden="true" />
          <div className="pointer-events-none absolute -bottom-24 left-1/3 h-56 w-56 rounded-full bg-primary/25 blur-3xl" aria-hidden="true" />
          <div className="relative">
            <HeroTop y={ym.y} m={ym.m} stats={stats} loaded={!!data} diff={data ? stats.total - data.prevCount : 0} isCurrent={isCurrent} todayD={today.d} days={days}
              onPrev={() => setYm((v) => (v.m === 0 ? { y: v.y - 1, m: 11 } : { y: v.y, m: v.m - 1 }))}
              onNext={() => setYm((v) => (v.m === 11 ? { y: v.y + 1, m: 0 } : { y: v.y, m: v.m + 1 }))}
              onToday={() => setYm({ y: today.y, m: today.m })} />
            <HeroControls cumulative={cumulative} onCumulative={setCumulative} table={table} onTable={() => setTable((t) => !t)} canExport={!!me} exporting={exporting}
              onExport={async () => {
                if (!me) return;
                setExporting(true);
                await exportMonthXlsx(me, ym.y, ym.m);
                setExporting(false);
              }} />
            <div className="mt-4">
              {table ? (
                stats.total === 0 ? <p className="py-8 text-center text-sm text-white/85">Bu ayda iş qeydi yoxdur.</p> : <DaysTable y={ym.y} m={ym.m} stats={stats} />
              ) : (
                <>
                  <HeroChart y={ym.y} m={ym.m} series={stats.counts} todayDay={isCurrent ? today.d : null} cumulative={cumulative} />
                  {data && stats.total === 0 && <p className="mt-3 text-center text-sm text-white/85">Bu ayda iş qeydi yoxdur.</p>}
                </>
              )}
            </div>
          </div>
        </section>

        {data && (
          <div className="grid gap-5 lg:grid-cols-[1.1fr_1fr]">
            <section className="card">
              <h3 className="card-title mb-4 flex items-center gap-2"><CalendarDays size={18} className="text-primary" /> Ayın kalendarı</h3>
              <Heatmap y={ym.y} m={ym.m} counts={stats.counts} todayDay={isCurrent ? today.d : null} />
            </section>
            <TopPlaces top={stats.top} />
          </div>
        )}
      </div>
    </div>
  );
}
