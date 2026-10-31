import { notFound, redirect } from "next/navigation";
import { Page } from "@/components/Page";
import { asKind, KIND } from "@/lib/kinds";
import { fetchClientDetail } from "@/services/clients/fetchClientDetail.server";
import { fetchLastWork } from "@/services/clients/fetchLastWork.server";
import type { ClientDetailProps } from "@/types/clients";
import { monthJobDates } from "../../utils/monthJobDates";
import { ClientHero } from "../ClientHero";
import { UnitList } from "../UnitList";
import { LocationView } from "./LocationView";

// Şirkətin filialları və ya marketin mağazaları: üstdə vizit kartı, altında siyahı (səhifə özü sürüşür)
export async function ClientDetail({ id, kind }: ClientDetailProps) {
  const { client, units, logs, groups } = await fetchClientDetail(id);

  if (!client) notFound();
  // Market şirkətlər bölməsindən açılıbsa (və ya əksinə), düzgün bölməyə yönləndir.
  const realKind = asKind(client.kind);
  if (realKind !== kind) redirect(`${KIND[realKind].route}/${id}`);

  const monthDates = monthJobDates(logs, groups);
  // Bu ay iş yoxdursa, son işin tarixini ayrıca soruş
  const lastWork = monthDates.at(-1) ?? await fetchLastWork(id);

  const k = KIND[kind];
  const fixedPlace = kind === "company" && units.length === 0;
  const stats = {
    units: units.length,
    coords: units.filter((s) => s.lat != null && s.lng != null).length,
    monthWorks: monthDates.length,
    lastWork,
  };

  return (
    <Page
      title={k.section}
      subtitle={fixedPlace ? (client.address ?? "Sabit məkan") : `${units.length} ${k.unit}`}
      back={{ href: k.route, label: k.section }}
    >
      <div className="space-y-6">
        <ClientHero company={client} stats={stats} />
        {fixedPlace ? <LocationView company={client} /> : <UnitList units={units} kind={kind} />}
      </div>
    </Page>
  );
}
