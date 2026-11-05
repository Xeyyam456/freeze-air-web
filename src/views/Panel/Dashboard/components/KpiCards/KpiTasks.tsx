import Link from "next/link";
import { ListChecks } from "lucide-react";
import type { KpiCardProps } from "@/types/panelDash";
import { CountUp } from "../CountUp";
import { DashCard } from "../DashCard";
import { KpiHead } from "./KpiHead";
import s from "./KpiCards.module.css";

// Bugünkü tapşırıqlar: neçəsi görülüb + zolaq; klik → Tapşırıqlar
export function KpiTasks({ stats }: KpiCardProps) {
  const t = stats?.tasks;
  const pct = t?.total ? Math.round((t.done / t.total) * 100) : 0;
  const open = t ? t.total - t.done : 0;
  return (
    <DashCard tone="orange">
      <KpiHead icon={ListChecks} />
      <div className={s.value}><b>{t ? <CountUp value={t.done} /> : "…"}</b><span className={s.of}>/ {t?.total ?? 0}</span></div>
      <p className={s.label}>Bugünkü tapşırıq</p>
      <Link href="/tapshiriqlar" className={s.progress}>
        <span className={s.progressText}>
          <span>{!t?.total ? "Bu gün tapşırıq yoxdur" : open ? `${open} qalıb` : "Hamısı görülüb"}</span><b>{pct}%</b>
        </span>
        <span className={s.track}><span style={{ width: `${pct}%` }} /></span>
      </Link>
    </DashCard>
  );
}
