import { notFound, redirect } from "next/navigation";
import { MapPin } from "lucide-react";
import { Page } from "@/components/Page";
import { WithSidePanel } from "@/components/SidePanel";
import type { Tables } from "@/lib/database.types";
import { createClient } from "@/lib/supabase/server";
import { asKind, KIND, type Kind } from "@/lib/kinds";
import { mapEmbedUrl } from "@/lib/navigation";
import { ClientInfoCard } from "./ClientInfo";
import { UnitList } from "./UnitList";

// Filialı olmayan (sabit məkanlı) şirkət: siyahı əvəzinə yeri böyük xəritədə
function LocationView({ company }: { company: Tables<"companies"> }) {
  const hasLocation = (company.lat != null && company.lng != null) || !!company.address;

  if (!hasLocation) {
    return (
      <div className="card flex h-full flex-col items-center justify-center text-center">
        <span className="icon-tile"><MapPin size={20} /></span>
        <p className="mt-3 font-semibold">Ünvan yazılmayıb</p>
        <p className="muted text-sm">Bu şirkətin ünvanı hələ daxil edilməyib.</p>
      </div>
    );
  }

  return (
    <div className="h-full overflow-hidden rounded-2xl border border-line bg-surface">
      <iframe
        src={mapEmbedUrl(company)}
        title={`${company.name} xəritədə`}
        className="block h-full w-full"
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
      />
    </div>
  );
}

// Şirkətin filialları və ya marketin mağazaları
export async function ClientDetail({ id, kind }: { id: number; kind: Kind }) {
  const supabase = await createClient();
  const [{ data: client }, { data: units }] = await Promise.all([
    supabase.from("companies").select("*").eq("id", id).maybeSingle(),
    supabase.from("stores").select("*").eq("company_id", id).order("code"),
  ]);

  if (!client) notFound();
  // Market şirkətlər bölməsindən açılıbsa (və ya əksinə), düzgün bölməyə yönləndir.
  const realKind = asKind(client.kind);
  if (realKind !== kind) redirect(`${KIND[realKind].route}/${id}`);

  const k = KIND[kind];
  const list = units ?? [];
  const fixedPlace = kind === "company" && list.length === 0;

  return (
    <Page
      title={client.name}
      subtitle={fixedPlace ? (client.address ?? "Sabit məkan") : `${list.length} ${k.unit}`}
      back={{ href: k.route, label: k.section }}
    >
      <WithSidePanel fill={fixedPlace} panel={<ClientInfoCard company={client} unitCount={list.length} />}>
        {fixedPlace ? <LocationView company={client} /> : <UnitList units={list} kind={kind} />}
      </WithSidePanel>
    </Page>
  );
}
