import { Suspense } from "react";
import { Page } from "@/components/Page";
import { ClientDetail } from "@/components/clients/ClientDetail";

export default function CompanyPage({ params }: PageProps<"/sirketler/[id]">) {
  return (
    <Suspense fallback={<Page title="Yüklənir..."><div className="card muted">Yüklənir...</div></Page>}>
      {params.then(({ id }) => <ClientDetail id={Number(id)} kind="company" />)}
    </Suspense>
  );
}
