import { Suspense } from "react";
import { Page } from "@/components/Page";
import { WithSidePanel } from "@/components/SidePanel";
import { ClientList } from "@/components/clients/ClientList";

export default function CompaniesPage() {
  return (
    <Page title="Şirkətlər" subtitle="Müqavilə bağladığımız şirkətlər və onların filialları">
      <WithSidePanel>
        <Suspense fallback={<div className="card muted">Yüklənir...</div>}>
          <ClientList kind="company" emptyHint="Hələ heç nə əlavə olunmayıb." />
        </Suspense>
      </WithSidePanel>
    </Page>
  );
}
