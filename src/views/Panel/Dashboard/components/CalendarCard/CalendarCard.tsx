import { CalendarDays } from "lucide-react";
import type { CalendarCardProps } from "@/types/panelDash";
import { Heatmap } from "@/components/work/MonthStats/components/Heatmap";
import { MONTHS } from "@/components/work/MonthStats/utils/chart";
import { DashCard } from "../DashCard";
import s from "./CalendarCard.module.css";

// Ayın kalendarı (istilik xəritəsi): seçilmiş ayın hər günü iş sayına görə rənglənir
export function CalendarCard({ view: v, className = "" }: CalendarCardProps) {
  return (
    <DashCard tone="violet" className={`${s.card} ${className}`}
      title={<><CalendarDays size={17} className={s.icon} /> Ayın kalendarı</>} subtitle={`${MONTHS[v.ym.m]} ${v.ym.y}`}>
      <Heatmap key={`${v.ym.y}-${v.ym.m}`} y={v.ym.y} m={v.ym.m} counts={v.stats.counts} todayDay={v.isCurrent ? v.today.d : null} />
    </DashCard>
  );
}
