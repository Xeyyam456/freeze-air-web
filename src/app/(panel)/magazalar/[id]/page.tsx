import { Suspense } from "react";
import { Page } from "@/components/Page";
import { ClientDetail } from "@/views/Clients/components/ClientDetail";
import { Card } from "@/shared/components/Card";

export default function MarketPage({ params }: PageProps<"/magazalar/[id]">) {
  return (
    <Suspense fallback={<Page title="Yüklənir..."><Card className="muted">Yüklənir...</Card></Page>}>
      {params.then(({ id }) => <ClientDetail id={Number(id)} kind="market" />)}
    </Suspense>
  );
}
