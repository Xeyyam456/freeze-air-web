import { Suspense } from "react";
import { Page } from "@/components/Page";
import { MonthStats } from "@/components/work/MonthStats";
import { Card } from "@/shared/components/Card";

export default function StatsPage() {
  return (
    <Page title="Statistika" subtitle="Ay ərzində gördüyün işlər">
      {/* Tarix render zamanı oxunur (new Date): Next 16 bunu Suspense daxilində tələb edir */}
      <Suspense fallback={<Card className="muted">Yüklənir...</Card>}>
        <MonthStats />
      </Suspense>
    </Page>
  );
}
