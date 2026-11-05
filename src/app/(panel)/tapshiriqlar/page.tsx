import { Suspense } from "react";
import { Page } from "@/components/Page";
import { Prefetch } from "@/components/panel/Prefetch";
import { TasksView } from "@/views/Tasks";
import { prefetchTasks } from "@/views/Tasks/queries/prefetchTasks.server";
import { Card } from "@/shared/components/Card";

// Çərçivəsiz: səhifə özü sürüşür (həftə zolağı, mənim günüm, mənim tapşırıqlarım, komanda). Məlumat serverdə əvvəlcədən (Prefetch).
export default function TasksPage() {
  return (
    <Page title="Tapşırıqlar" subtitle="Günün işləri: hansı usta, harada, nə üçün">
      {/* Cookie və tarix render zamanı oxunur (new Date): Next 16 bunu Suspense daxilində tələb edir */}
      <Suspense fallback={<Card className="muted">Yüklənir...</Card>}>
        <Prefetch load={prefetchTasks}>
          <TasksView />
        </Prefetch>
      </Suspense>
    </Page>
  );
}
