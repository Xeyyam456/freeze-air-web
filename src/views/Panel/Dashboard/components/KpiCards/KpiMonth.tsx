import { CalendarDays, TrendingDown, TrendingUp } from "lucide-react";
import type { KpiCardProps } from "@/types/panelDash";
import { CountUp } from "../CountUp";
import { DashCard } from "../DashCard";
import { KpiHead } from "./KpiHead";
import s from "./KpiCards.module.css";

// Bu ay görülən iş + əvvəlki aya görə fərq; altda iş görülən gün və fərqli yer sayı
export function KpiMonth({ stats, month, prev, todayD }: KpiCardProps) {
  const diff = stats && prev !== null ? stats.month - prev : null;
  const badge = diff === null ? null : (
    <span className={`${s.badge} ${diff < 0 ? s.down : s.up}`} title="Əvvəlki ayın cəminə görə">
      {diff > 0 ? <TrendingUp size={12} /> : diff < 0 ? <TrendingDown size={12} /> : null}
      {diff > 0 ? `+${diff}` : diff < 0 ? `−${Math.abs(diff)}` : "Eyni"}
    </span>
  );
  return (
    <DashCard tone="green">
      <KpiHead icon={CalendarDays} badge={badge} />
      <div className={s.value}><b>{stats ? <CountUp value={stats.month} /> : "…"}</b><span className={s.of}>iş</span></div>
      <p className={s.label}>Bu ay görülən iş</p>
      <div className={s.facts}>
        <span title="Ayın keçən günlərindən (bazar da daxil) neçəsində iş yazılıb"><small>İş görülən gün</small><b>{month?.active ?? "…"}<i> / {todayD} gün</i></b></span>
        <span><small>Fərqli yer</small><b>{month?.placeCount ?? "…"}</b></span>
      </div>
    </DashCard>
  );
}
