import { Suspense } from "react";
import { Page } from "@/components/Page";
import { fetchManagers } from "@/services/management/fetchManagers.server";
import { ManagerList } from "@/views/Management/components/ManagerList";

// Rəhbərlik: yalnız baxış; karta klik məlumat pəncərəsini açır
async function Content() {
  return <ManagerList managers={await fetchManagers()} />;
}

export default function ManagementPage() {
  return (
    <Page title="Rəhbərlik" subtitle="Müdir, servis müdirləri və maliyyəçi">
      <Suspense fallback={<div className="card muted">Yüklənir...</div>}>
        <Content />
      </Suspense>
    </Page>
  );
}
