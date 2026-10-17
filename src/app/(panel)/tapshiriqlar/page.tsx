import { Suspense } from "react";
import { Page } from "@/components/Page";
import { WithSidePanel } from "@/components/SidePanel";
import { TasksView } from "@/components/work/TasksView";

export default function TasksPage() {
  return (
    <Page title="Tapşırıqlar" subtitle="Günün işləri: hansı usta, harada, nə üçün">
      <WithSidePanel>
        {/* Tarix render zamanı oxunur (new Date): Next 16 bunu Suspense daxilində tələb edir */}
        <Suspense fallback={<div className="card muted">Yüklənir...</div>}>
          <TasksView />
        </Suspense>
      </WithSidePanel>
    </Page>
  );
}
