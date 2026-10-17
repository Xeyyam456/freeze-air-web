import { Suspense } from "react";
import { Page } from "@/components/Page";
import { MonthStats } from "@/components/work/MonthStats";

export default function StatsPage() {
  return (
    <Page title="Statistika" subtitle="Ay ərzində gördüyün işlər">
      {/* Tarix render zamanı oxunur (new Date): Next 16 bunu Suspense daxilində tələb edir */}
      <Suspense fallback={<div className="card muted">Yüklənir...</div>}>
        <MonthStats />
      </Suspense>
    </Page>
  );
}
