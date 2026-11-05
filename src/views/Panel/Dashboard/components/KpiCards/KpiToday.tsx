import { CalendarCheck } from "lucide-react";
import type { KpiCardProps } from "@/types/panelDash";
import { MONTHS } from "@/components/work/MonthStats/utils/chart";
import { CountUp } from "../CountUp";
import { DashCard } from "../DashCard";
import { MiniBars } from "../MiniBars";
import { KpiHead } from "./KpiHead";
import s from "./KpiCards.module.css";

// Bu gün görülən iş + bu ayın son 7 gününün sütunları (sonuncu bu gün)
export function KpiToday({ stats, month, todayD, m: mi }: KpiCardProps) {
  const m = MONTHS[mi].toLowerCase();
  const from = Math.max(0, todayD - 7);
  const bars = (month?.counts ?? []).slice(from, todayD).map((v, i) => ({ label: String(from + i + 1), value: v, tip: `${from + i + 1} ${m} · ${v} iş` }));
  return (
    <DashCard tone="blue">
      <KpiHead icon={CalendarCheck} />
      <div className={s.value}><b>{stats ? <CountUp value={stats.today} /> : "…"}</b><span className={s.of}>iş</span></div>
      <p className={s.label}>Bu gün görülən iş</p>
      {bars.length > 0 && <MiniBars bars={bars} />}
    </DashCard>
  );
}
