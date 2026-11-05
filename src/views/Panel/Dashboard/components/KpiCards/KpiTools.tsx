import Link from "next/link";
import { ArrowRight, Wrench } from "lucide-react";
import type { KpiCardProps } from "@/types/panelDash";
import { CountUp } from "../CountUp";
import { DashCard } from "../DashCard";
import { KpiHead } from "./KpiHead";
import s from "./KpiCards.module.css";

// Məndə olan alətlər və material növləri; klik → Alətlərim
export function KpiTools({ stats }: KpiCardProps) {
  return (
    <DashCard tone="violet">
      <KpiHead icon={Wrench} />
      <div className={s.value}><b>{stats ? <CountUp value={stats.tools} /> : "…"}</b><span className={s.of}>alət</span></div>
      <p className={s.label}>Məndə olan</p>
      <Link href="/aletlerim" className={s.more}>
        <span>{stats ? (stats.materials ? `${stats.materials} növ material` : "Material yoxdur") : "…"}</span>
        <ArrowRight size={14} />
      </Link>
    </DashCard>
  );
}
