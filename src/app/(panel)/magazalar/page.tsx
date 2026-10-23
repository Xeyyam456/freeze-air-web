import { Suspense } from "react";
import { Page } from "@/components/Page";
import { ClientList } from "@/components/clients/ClientList";

export default function StoresPage() {
  return (
    <Page title="Mağazalar" subtitle="Müqavilə bağladığımız mağazalar və onların filialları">
      <Suspense fallback={<div className="card muted">Yüklənir...</div>}>
        <ClientList kind="market" emptyHint="Hələ heç nə əlavə olunmayıb." />
      </Suspense>
    </Page>
  );
}
