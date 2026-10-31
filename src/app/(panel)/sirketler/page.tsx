import { Suspense } from "react";
import { Page } from "@/components/Page";
import { ClientList } from "@/views/Clients/components/ClientList";
import { Card } from "@/shared/components/Card";

export default function CompaniesPage() {
  return (
    <Page title="Şirkətlər" subtitle="Müqavilə bağladığımız şirkətlər və onların filialları">
      <Suspense fallback={<Card className="muted">Yüklənir...</Card>}>
        <ClientList kind="company" emptyHint="Hələ heç nə əlavə olunmayıb." />
      </Suspense>
    </Page>
  );
}
