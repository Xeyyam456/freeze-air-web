import { MapPin, Phone, StickyNote, User } from "lucide-react";
import type { Tables } from "@/lib/database.types";
import { asKind, KIND } from "@/lib/kinds";
import { PlaceHistoryButton } from "@/components/work/PlaceHistory";
import { coordPercent, shortDateAz } from "./stats";

export type ClientStats = { units: number; coords: number; monthWorks: number; lastWork: string | null };

// Tünd kartdakı rəqəm
function HeroStat({ label, value, tone = "" }: { label: string; value: string | number; tone?: string }) {
  return (
    <div>
      <dt className="text-xs text-white/55">{label}</dt>
      <dd className={`text-2xl font-extrabold tabular-nums leading-tight ${tone}`}>{value}</dd>
    </div>
  );
}

// Səhifənin başı: şirkətin/marketin vizit kartı (yalnız baxış) + rəqəmlər + bütün obyektin iş tarixçəsi
export function ClientHero({ company, stats }: { company: Tables<"companies">; stats: ClientStats }) {
  const kind = asKind(company.kind);
  const k = KIND[kind];
  const fixedPlace = kind === "company" && stats.units === 0;

  return (
    <section className="rounded-[18px] bg-[#0c1b36] bg-[radial-gradient(560px_240px_at_100%_0%,rgba(34,195,230,0.22),transparent_70%)] px-6 py-5 text-white max-sm:px-4">
      <div className="flex flex-wrap items-center gap-x-8 gap-y-5">
        <div className="flex min-w-0 flex-[1_1_320px] items-center gap-4">
          <span className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-frost to-primary text-2xl font-extrabold shadow-[0_8px_24px_rgba(34,195,230,0.35)]">
            {company.name.charAt(0)}
          </span>
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wider text-white/50">{k.One}</p>
            <h2 className="line-clamp-2 text-2xl font-extrabold leading-tight max-sm:text-xl">{company.name}</h2>
            <p className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-white/75">
              <span className="flex min-w-0 items-center gap-1.5"><User size={14} className="shrink-0 text-white/50" />{company.contact_person ?? "Əlaqəli şəxs yoxdur"}</span>
              {company.phone
                ? <a href={`tel:${company.phone}`} className="flex items-center gap-1.5 font-semibold text-frost hover:underline"><Phone size={14} />{company.phone}</a>
                : <span className="flex items-center gap-1.5"><Phone size={14} className="text-white/50" />Telefon yoxdur</span>}
              {fixedPlace && (
                <span className="flex min-w-0 items-center gap-1.5"><MapPin size={14} className="shrink-0 text-white/50" />{company.address ?? "Ünvan yazılmayıb"}</span>
              )}
            </p>
          </div>
        </div>

        <dl className="flex flex-wrap gap-x-9 gap-y-3 max-sm:grid max-sm:basis-full max-sm:grid-cols-2 max-sm:gap-2 max-sm:[&>div]:rounded-xl max-sm:[&>div]:bg-white/[0.07] max-sm:[&>div]:px-3 max-sm:[&>div]:py-2">
          {!fixedPlace && <HeroStat label={k.Unit} value={stats.units} />}
          {!fixedPlace && <HeroStat label="Koordinatlı" value={`${coordPercent(stats.coords, stats.units)}%`} />}
          <HeroStat label="Bu ay iş" value={stats.monthWorks} tone="text-frost" />
          <HeroStat label="Son iş" value={stats.lastWork ? shortDateAz(stats.lastWork) : "—"} />
        </dl>

        {/* Bütün obyektin (özü + filialları/mağazaları) iş tarixçəsi */}
        <PlaceHistoryButton target={{ title: company.name, companyId: company.id }}
          className="btn shrink-0 !bg-white/10 !text-white ring-1 ring-white/15 hover:!bg-white/20 max-sm:w-full sm:max-lg:ml-auto" />
      </div>
      {company.notes && (
        <p className="mt-4 flex items-start gap-2 border-t border-white/10 pt-3 text-sm text-white/70">
          <StickyNote size={15} className="mt-0.5 shrink-0 text-white/40" />{company.notes}
        </p>
      )}
    </section>
  );
}
