import { Suspense } from "react";
import { Page } from "@/components/Page";
import { PanelDashboard } from "@/views/Panel/Dashboard";
import { DashFallback } from "@/views/Panel/Dashboard/components/DashFallback";
import { PanelPrefetch } from "@/views/Panel/Dashboard/components/PanelPrefetch";

// Usta paneli: Panel + Statistika bir səhifədə (2026-11-05). Məlumat serverdə əvvəlcədən yüklənir (PanelPrefetch).
// Cookie və tarix render zamanı oxunur: Suspense daxilində (Next 16)
export default function Home() {
  return (
    <Page title="Panel" subtitle="Mənim bugünüm, işlərim və aylıq statistikam">
      <Suspense fallback={<DashFallback />}>
        <PanelPrefetch>
          <PanelDashboard />
        </PanelPrefetch>
      </Suspense>
    </Page>
  );
}
