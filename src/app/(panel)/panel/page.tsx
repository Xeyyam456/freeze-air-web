import { Suspense } from "react";
import { Page } from "@/components/Page";
import { PanelDashboard } from "@/views/Panel/Dashboard";
import { DashFallback } from "@/views/Panel/Dashboard/DashFallback";

// Usta paneli: Panel + Statistika bir səhifədə (2026-11-05). Tarix render zamanı oxunur (new Date): Suspense daxilində (Next 16)
export default function Home() {
  return (
    <Page title="Panel" subtitle="Mənim bugünüm, işlərim və aylıq statistikam">
      <Suspense fallback={<DashFallback />}>
        <PanelDashboard />
      </Suspense>
    </Page>
  );
}
