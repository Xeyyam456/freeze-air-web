import Link from "next/link";
import { ArrowUpRight, Building2, MapPin, Phone, Store, User } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { KIND, type Kind } from "@/lib/kinds";
import { coordPercent, monthStartBaku } from "./stats";

// Kartdakı kiçik rəqəm xanası
function Stat({ label, value, tone = "" }: { label: string; value: string | number; tone?: string }) {
  return (
    <div className="min-w-0 rounded-xl bg-bg px-3 py-2">
      <p className="muted truncate text-[11px] font-semibold uppercase tracking-wide max-[400px]:text-[10px] max-[400px]:tracking-normal">{label}</p>
      <p className={`text-lg font-extrabold tabular-nums leading-tight ${tone}`}>{value}</p>
    </div>
  );
}

// Şirkətlərin və ya market şəbəkələrinin siyahısı: üstdə tünd xülasə, altında iri kartlar (filial/mağaza sayı, koordinat, bu ayın işləri)
export async function ClientList({ kind, emptyHint }: { kind: Kind; emptyHint: string }) {
  const supabase = await createClient();
  const [{ data: clients }, { data: works }] = await Promise.all([
    supabase
      .from("companies")
      .select("id, name, phone, address, contact_person, stores(lat, lng)")
      .eq("kind", kind)
      .order("name"),
    // Bu ayın işləri: ya birbaşa şirkətə (sabit məkan), ya da filialına/mağazasına yazılır
    supabase.from("work_logs").select("company_id, s:stores(company_id)").gte("work_date", monthStartBaku()),
  ]);

  const k = KIND[kind];
  const Icon = kind === "market" ? Store : Building2;

  if (!clients?.length) {
    return (
      <div className="card py-12 text-center">
        <span className="icon-tile mx-auto"><Icon size={20} /></span>
        <p className="mt-3 font-semibold">Hələ {k.one} yoxdur</p>
        <p className="muted text-sm">{emptyHint}</p>
      </div>
    );
  }

  const monthWorks = new Map<number, number>();
  for (const w of works ?? []) {
    const id = w.company_id ?? w.s?.company_id;
    if (id != null) monthWorks.set(id, (monthWorks.get(id) ?? 0) + 1);
  }

  const rows = clients.map((c) => ({
    ...c,
    units: c.stores.length,
    coords: c.stores.filter((s) => s.lat != null && s.lng != null).length,
    works: monthWorks.get(c.id) ?? 0,
  }));
  const totalUnits = rows.reduce((n, r) => n + r.units, 0);
  const totalCoords = rows.reduce((n, r) => n + r.coords, 0);
  const totalWorks = rows.reduce((n, r) => n + r.works, 0);
  const fixed = rows.filter((r) => r.units === 0).length;

  return (
    <div className="space-y-6">
      {/* Xülasə: neçə müştəri, neçə filial/mağaza, koordinat örtüyü, bu ay görülən iş */}
      <section className="flex flex-wrap items-center gap-x-10 gap-y-4 rounded-[18px] bg-[#0c1b36] bg-[radial-gradient(520px_220px_at_100%_0%,rgba(34,195,230,0.22),transparent_70%)] px-6 py-5 text-white max-sm:gap-y-3 max-sm:px-4">
        <div className="flex items-center gap-4">
          <span className="grid h-14 w-14 place-items-center rounded-2xl bg-white/10 text-frost"><Icon size={26} /></span>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-white/50">{k.section}</p>
            <p className="text-2xl font-extrabold leading-tight">{rows.length} {k.one}</p>
          </div>
        </div>
        <dl className="flex flex-1 flex-wrap gap-x-10 gap-y-3 max-sm:grid max-sm:basis-full max-sm:grid-cols-2 max-sm:gap-2 max-sm:[&>div]:rounded-xl max-sm:[&>div]:bg-white/[0.07] max-sm:[&>div]:px-3 max-sm:[&>div]:py-2 max-sm:[&_dd]:text-xl max-sm:[&>div:last-child:nth-child(odd)]:col-span-2">
          <div>
            <dt className="text-xs text-white/55">{k.Unit} cəmi</dt>
            <dd className="text-2xl font-extrabold tabular-nums">{totalUnits}</dd>
          </div>
          {kind === "company" && (
            <div>
              <dt className="text-xs text-white/55">Sabit məkan</dt>
              <dd className="text-2xl font-extrabold tabular-nums">{fixed}</dd>
            </div>
          )}
          {totalUnits > 0 && (
            <div>
              <dt className="text-xs text-white/55">Koordinatlı</dt>
              <dd className="text-2xl font-extrabold tabular-nums">{coordPercent(totalCoords, totalUnits)}%</dd>
            </div>
          )}
          <div>
            <dt className="text-xs text-white/55">Bu ay iş</dt>
            <dd className="text-2xl font-extrabold tabular-nums text-frost">{totalWorks}</dd>
          </div>
        </dl>
      </section>

      <div className="flex flex-wrap gap-4">
        {rows.map((c) => {
          const fixedPlace = kind === "company" && c.units === 0;
          return (
            <Link key={c.id} href={`${k.route}/${c.id}`} className="card card-link group flex min-w-0 grow basis-[380px] flex-col gap-4 !p-5">
              <div className="flex items-center gap-3">
                <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-frost to-primary text-xl font-extrabold text-white shadow-[0_6px_16px_rgba(31,111,235,0.3)]">
                  {c.name.charAt(0)}
                </span>
                <div className="min-w-0 flex-1">
                  <h3 className="line-clamp-2 text-base font-bold leading-snug">{c.name}</h3>
                  <p className="muted text-xs font-medium">{fixedPlace ? "Sabit məkan" : `${c.units} ${k.unit}`}</p>
                </div>
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-bg text-muted transition-colors group-hover:bg-primary group-hover:text-white">
                  <ArrowUpRight size={18} />
                </span>
              </div>

              {fixedPlace ? (
                <div className="grid grid-cols-[1fr_auto] gap-2">
                  <div className="min-w-0 rounded-xl bg-bg px-3 py-2">
                    <p className="muted flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide"><MapPin size={12} /> Ünvan</p>
                    <p className="line-clamp-2 text-sm font-semibold">{c.address ?? "Yazılmayıb"}</p>
                  </div>
                  <Stat label="Bu ay iş" value={c.works} tone={c.works ? "text-primary" : ""} />
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <Stat label={k.Unit} value={c.units} />
                  <Stat label="Bu ay iş" value={c.works} tone={c.works ? "text-primary" : ""} />
                </div>
              )}

              <p className="muted mt-auto flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-dashed border-line pt-3 text-[13px]">
                <span className="flex min-w-0 items-center gap-1.5"><User size={13} className="shrink-0" /><span className="truncate">{c.contact_person ?? "Əlaqəli şəxs yoxdur"}</span></span>
                <span className="flex items-center gap-1.5"><Phone size={13} />{c.phone ?? "Telefon yoxdur"}</span>
              </p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
