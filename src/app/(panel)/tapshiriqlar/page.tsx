import { Suspense } from "react";
import { Page } from "@/components/Page";
import { TasksView } from "@/components/work/TasksView";

// Çərçivəsiz: səhifə özü sürüşür (həftə zolağı, mənim günüm, mənim tapşırıqlarım, komanda)
export default function TasksPage() {
  return (
    <Page title="Tapşırıqlar" subtitle="Günün işləri: hansı usta, harada, nə üçün">
      {/* Tarix render zamanı oxunur (new Date): Next 16 bunu Suspense daxilində tələb edir */}
      <Suspense fallback={<div className="card muted">Yüklənir...</div>}>
        <TasksView />
      </Suspense>
    </Page>
  );
}
