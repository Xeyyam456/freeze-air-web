import { Suspense } from "react";
import { Page } from "@/components/Page";
import { ClientDetail } from "@/views/Clients/components/ClientDetail";

export default function MarketPage({ params }: PageProps<"/magazalar/[id]">) {
  return (
    <Suspense fallback={<Page title="Yüklənir..."><div className="card muted">Yüklənir...</div></Page>}>
      {params.then(({ id }) => <ClientDetail id={Number(id)} kind="market" />)}
    </Suspense>
  );
}
