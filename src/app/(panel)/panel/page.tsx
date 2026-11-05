import { Suspense } from "react";
import { Page } from "@/components/Page";
import { Prefetch } from "@/components/panel/Prefetch";
import { PanelDashboard } from "@/views/Panel/Dashboard";
import { DashFallback } from "@/views/Panel/Dashboard/components/DashFallback";
import { prefetchPanel } from "@/views/Panel/Dashboard/queries/prefetchPanel.server";

// Usta paneli: Panel + Statistika bir səhifədə (2026-11-05). Məlumat serverdə əvvəlcədən yüklənir (Prefetch).
// Cookie və tarix render zamanı oxunur: Suspense daxilində (Next 16)
export default function Home() {
  return (
    <Page title="Panel" subtitle="Mənim bugünüm, işlərim və aylıq statistikam">
      <Suspense fallback={<DashFallback />}>
        <Prefetch load={prefetchPanel}>
          <PanelDashboard />
        </Prefetch>
      </Suspense>
    </Page>
  );
}
