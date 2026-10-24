import { notFound, redirect } from "next/navigation";
import { MapPin, Navigation2 } from "lucide-react";
import { Page } from "@/components/Page";
import type { Tables } from "@/lib/database.types";
import { createClient } from "@/lib/supabase/server";
import { asKind, KIND, type Kind } from "@/lib/kinds";
import { mapEmbedUrl, wazeUrl } from "@/lib/navigation";
import { PlaceLocationButton } from "@/components/PlaceLocationButton";
import { ClientHero } from "./ClientInfo";
import { monthStartBaku } from "./stats";
import { UnitList } from "./UnitList";

// Filialı olmayan (sabit məkanlı) şirkət: siyahı əvəzinə yeri böyük xəritədə
function LocationView({ company }: { company: Tables<"companies"> }) {
  const hasLocation = (company.lat != null && company.lng != null) || !!company.address;

  if (!hasLocation) {
    return (
      <div className="card flex flex-col items-center justify-center py-16 text-center">
        <span className="icon-tile"><MapPin size={20} /></span>
        <p className="mt-3 font-semibold">Ünvan yazılmayıb</p>
        <p className="muted text-sm">Bu şirkətin ünvanı hələ daxil edilməyib.</p>
      </div>
    );
  }

  return (
    <div className="relative h-[clamp(320px,calc(100vh-var(--topbar-h)-200px),720px)] overflow-hidden rounded-[18px] border border-line bg-surface p-2">
      <iframe
        src={mapEmbedUrl(company)}
        title={`${company.name} xəritədə`}
        className="block h-full w-full rounded-xl"
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
      />
      {/* Ünvan/koordinat səhvdirsə usta düzəldir (0087) */}
      <div className="absolute right-4 top-4 max-sm:right-3 max-sm:top-3">
        <PlaceLocationButton place={{ kind: "company", id: company.id, name: company.name, address: company.address, lat: company.lat, lng: company.lng }}
          className="btn btn-sm bg-white text-ink shadow-[0_6px_18px_rgba(6,25,43,0.25)] hover:bg-bg" />
      </div>
      {/* Yalnız telefonda (< 640): Waze ilə ünvana naviqasiya */}
      <a href={wazeUrl(company)} target="_blank" rel="noopener noreferrer"
        className="absolute bottom-5 left-1/2 inline-flex h-10 -translate-x-1/2 items-center gap-2 rounded-full bg-[#33ccff] px-5 text-sm font-bold text-[#06192b] shadow-[0_10px_24px_rgba(6,25,43,0.3)] sm:hidden">
        <Navigation2 size={16} /> Waze ilə get
      </a>
    </div>
  );
}

// Şirkətin filialları və ya marketin mağazaları: üstdə vizit kartı, altında siyahı (səhifə özü sürüşür)
export async function ClientDetail({ id, kind }: { id: number; kind: Kind }) {
  const supabase = await createClient();
  const monthStart = monthStartBaku();
  // İşlər ya birbaşa şirkətə (sabit məkan), ya da filialına/mağazasına yazılır: ikisi ayrıca sayılır
  const direct = () => supabase.from("work_logs").select("work_date").eq("company_id", id);
  const viaUnit = () => supabase.from("work_logs").select("work_date, s:stores!inner(company_id)").eq("s.company_id", id);
  const [{ data: client }, { data: units }, d, u] = await Promise.all([
    supabase.from("companies").select("*").eq("id", id).maybeSingle(),
    supabase.from("stores").select("*").eq("company_id", id).order("code"),
    direct().gte("work_date", monthStart),
    viaUnit().gte("work_date", monthStart),
  ]);

  if (!client) notFound();
  // Market şirkətlər bölməsindən açılıbsa (və ya əksinə), düzgün bölməyə yönləndir.
  const realKind = asKind(client.kind);
  if (realKind !== kind) redirect(`${KIND[realKind].route}/${id}`);

  // Bu ay iş yoxdursa, son işin tarixini ayrıca soruş
  const monthDates = [...(d.data ?? []), ...(u.data ?? [])].map((w) => w.work_date).sort();
  let lastWork = monthDates.at(-1) ?? null;
  if (!lastWork) {
    const [ld, lu] = await Promise.all([
      direct().order("work_date", { ascending: false }).limit(1),
      viaUnit().order("work_date", { ascending: false }).limit(1),
    ]);
    lastWork = [ld.data?.[0]?.work_date, lu.data?.[0]?.work_date].filter(Boolean).sort().at(-1) ?? null;
  }

  const k = KIND[kind];
  const list = units ?? [];
  const fixedPlace = kind === "company" && list.length === 0;
  const stats = {
    units: list.length,
    coords: list.filter((s) => s.lat != null && s.lng != null).length,
    monthWorks: monthDates.length,
    lastWork,
  };

  return (
    <Page
      title={k.section}
      subtitle={fixedPlace ? (client.address ?? "Sabit məkan") : `${list.length} ${k.unit}`}
      back={{ href: k.route, label: k.section }}
    >
      <div className="space-y-6">
        <ClientHero company={client} stats={stats} />
        {fixedPlace ? <LocationView company={client} /> : <UnitList units={list} kind={kind} />}
      </div>
    </Page>
  );
}
