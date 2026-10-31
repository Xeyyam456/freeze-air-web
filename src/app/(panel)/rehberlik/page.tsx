import { Suspense } from "react";
import { Page } from "@/components/Page";
import { fetchManagers } from "@/services/management/fetchManagers.server";
import { ManagerList } from "@/views/Management/components/ManagerList";
import { Card } from "@/shared/components/Card";

// Rəhbərlik: yalnız baxış; karta klik məlumat pəncərəsini açır
async function Content() {
  return <ManagerList managers={await fetchManagers()} />;
}

export default function ManagementPage() {
  return (
    <Page title="Rəhbərlik" subtitle="Müdir, servis müdirləri və maliyyəçi">
      <Suspense fallback={<Card className="muted">Yüklənir...</Card>}>
        <Content />
      </Suspense>
    </Page>
  );
}
