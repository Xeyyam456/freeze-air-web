"use client";

import { PushPrompt } from "@/components/panel/PushPrompt";
import { MyDay } from "@/components/work/MyDay";
import { WorkHistory } from "@/components/work/WorkHistory";
import { CalendarCard } from "./components/CalendarCard";
import { DashCard } from "./components/DashCard";
import { KpiMonth, KpiTasks, KpiToday, KpiTools } from "./components/KpiCards";
import { MonthCard } from "./components/MonthCard";
import { PlacesCard } from "./components/PlacesCard";
import { useDashStats } from "./hooks/useDashStats";
import { useMonthView } from "./hooks/useMonthView";
import s from "./styles/Dashboard.module.css";

// Usta paneli (tünd premium dashboard; əvvəlki Panel + Statistika bir səhifədə, 2026-11-05):
// yuxarıda "Mənim bugünüm" (davamiyyət), 4 rəngli göstərici, ayın qrafiki + ən çox işlənən yerlər, görülən işlər + ayın kalendarı.
// Əməkdaş kartı olmayan hesabda (məs. yalnız admin) yalnız görülən işlər görünür.
export function PanelDashboard() {
  const v = useMonthView();
  const stats = useDashStats(v.me);
  const card = v.me !== null;
  const kpi = { stats, month: v.current, prev: v.prevCount, todayD: v.today.d, week: v.week };

  return (
    <div className={s.dash}>
      <div className={s.notice}><PushPrompt /></div>
      {card && <div className={s.today}><MyDay /></div>}
      {card && (
        <div className={s.kpis}>
          <KpiToday {...kpi} />
          <KpiMonth {...kpi} />
          <KpiTasks {...kpi} />
          <KpiTools {...kpi} />
        </div>
      )}
      {card && (
        <div className={s.month}>
          <MonthCard view={v} />
          <PlacesCard top={v.stats.top} loaded={!!v.data} />
        </div>
      )}
      <div className={s.bottom}>
        <DashCard className={s.history}><WorkHistory /></DashCard>
        {card && <CalendarCard view={v} />}
      </div>
    </div>
  );
}
