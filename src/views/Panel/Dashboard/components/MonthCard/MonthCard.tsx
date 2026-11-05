import { BarChart3, ChevronLeft, ChevronRight } from "lucide-react";
import type { MonthCardProps } from "@/types/panelDash";
import { DaysTable } from "@/components/work/MonthStats/components/DaysTable";
import { HeroChart } from "@/components/work/MonthStats/components/HeroChart";
import { HeroControls } from "@/components/work/MonthStats/components/HeroControls";
import { MONTHS } from "@/components/work/MonthStats/utils/chart";
import { CountUp } from "../CountUp";
import { DashCard } from "../DashCard";
import s from "./MonthCard.module.css";

// Ayın qrafiki (əvvəl ayrıca "Statistika" səhifəsi idi): ay seçimi, iri iş sayı, Günlük | Yığım, Excel, Qrafik | Cədvəl
export function MonthCard({ view: v, className = "" }: MonthCardProps) {
  const nav = (
    <div className={s.nav}>
      <button type="button" onClick={v.prev} aria-label="Əvvəlki ay"><ChevronLeft size={17} /></button>
      <button type="button" onClick={v.next} disabled={v.isCurrent} aria-label="Sonrakı ay"><ChevronRight size={17} /></button>
      {!v.isCurrent && <button type="button" onClick={v.toToday} className={s.today}>Bu ay</button>}
    </div>
  );
  return (
    <DashCard tone="blue" className={className} actions={nav}
      title={<><BarChart3 size={17} className={s.icon} /> {MONTHS[v.ym.m]} {v.ym.y}</>} subtitle="Ay ərzində gördüyün işlər">
      <div className={`${s.body} ${v.loaded ? "" : s.dim}`}>
        <div className={s.total}><b>{v.data ? <CountUp value={v.stats.total} /> : "…"}</b><span>iş</span></div>
        <HeroControls cumulative={v.cumulative} onCumulative={v.setCumulative} table={v.table} onTable={v.toggleTable}
          canExport={!!v.me} exporting={v.exporting} onExport={v.exportXlsx} />
        <div className={s.chart}>
          {!v.table && <span className={s.sweep} aria-hidden="true" />}
          {v.table ? (
            v.stats.total === 0 ? <p className={s.empty}>Bu ayda iş qeydi yoxdur.</p> : <DaysTable y={v.ym.y} m={v.ym.m} stats={v.stats} />
          ) : (
            <>
              <HeroChart key={`${v.ym.y}-${v.ym.m}-${v.cumulative}`} y={v.ym.y} m={v.ym.m} series={v.stats.counts}
                todayDay={v.isCurrent ? v.today.d : null} cumulative={v.cumulative} />
              {v.data && v.stats.total === 0 && <p className={s.empty}>Bu ayda iş qeydi yoxdur.</p>}
            </>
          )}
        </div>
      </div>
    </DashCard>
  );
}
