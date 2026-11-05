import { CalendarCheck } from "lucide-react";
import type { KpiCardProps } from "@/types/panelDash";
import { CountUp } from "../CountUp";
import { DashCard } from "../DashCard";
import { MiniBars } from "../MiniBars";
import { KpiHead } from "./KpiHead";
import s from "./KpiCards.module.css";

// Bu gün görülən iş + son 7 günün sütunları (sonuncu bu gün; ayın əvvəlində keçən ayın günləri də)
export function KpiToday({ stats, week }: KpiCardProps) {
  return (
    <DashCard tone="blue">
      <KpiHead icon={CalendarCheck} />
      <div className={s.value}><b>{stats ? <CountUp value={stats.today} /> : "…"}</b><span className={s.of}>iş</span></div>
      <p className={s.label}>Bu gün görülən iş</p>
      <MiniBars bars={week} />
    </DashCard>
  );
}
