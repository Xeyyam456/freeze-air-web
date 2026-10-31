import { Suspense } from "react";
import { Page } from "@/components/Page";
import { ClientList } from "@/views/Clients/components/ClientList";
import { Card } from "@/shared/components/Card";

export default function StoresPage() {
  return (
    <Page title="Mağazalar" subtitle="Müqavilə bağladığımız mağazalar və onların filialları">
      <Suspense fallback={<Card className="muted">Yüklənir...</Card>}>
        <ClientList kind="market" emptyHint="Hələ heç nə əlavə olunmayıb." />
      </Suspense>
    </Page>
  );
}
