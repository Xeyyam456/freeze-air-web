import { StickyNote } from "lucide-react";
import { asKind, KIND } from "@/lib/kinds";
import { PlaceHistoryButton } from "@/components/work/PlaceHistory";
import type { ClientHeroProps } from "@/types/clients";
import { coordPercent } from "../../utils/coordPercent";
import { shortDateAz } from "../../utils/shortDateAz";
import { HeroContact } from "./HeroContact";
import { HeroStat } from "./HeroStat";

// Səhifənin başı: şirkətin/marketin vizit kartı (yalnız baxış) + rəqəmlər + bütün obyektin iş tarixçəsi
export function ClientHero({ company, stats }: ClientHeroProps) {
  const kind = asKind(company.kind);
  const k = KIND[kind];
  const fixedPlace = kind === "company" && stats.units === 0;

  return (
    <section className="rounded-[18px] bg-[#0c1b36] bg-[radial-gradient(560px_240px_at_100%_0%,rgba(34,195,230,0.22),transparent_70%)] px-6 py-5 text-white max-sm:px-3.5 max-sm:py-3.5">
      <div className="flex flex-wrap items-center gap-x-8 gap-y-5 max-sm:gap-y-3">
        <div className="flex min-w-0 flex-[1_1_320px] items-center gap-4 max-sm:flex-wrap max-sm:gap-x-3 max-sm:gap-y-3">
          <span className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-frost to-primary text-2xl font-extrabold shadow-[0_8px_24px_rgba(34,195,230,0.35)] max-sm:h-11 max-sm:w-11 max-sm:rounded-xl max-sm:text-lg">
            {company.name.charAt(0)}
          </span>
          <div className="min-w-0 max-sm:flex-1 max-sm:self-center">
            <h2 className="line-clamp-2 text-2xl font-extrabold leading-tight max-sm:text-lg">{company.name}</h2>
            <HeroContact company={company} fixedPlace={fixedPlace} mobile={false} />
          </div>
          <HeroContact company={company} fixedPlace={fixedPlace} mobile />
        </div>

        <dl className="flex flex-wrap gap-x-9 gap-y-3 max-sm:grid max-sm:basis-full max-sm:grid-cols-2 max-sm:gap-2 max-sm:[&>div]:rounded-xl max-sm:[&>div]:bg-white/[0.07] max-sm:[&>div]:px-3 max-sm:[&>div]:py-1.5">
          {!fixedPlace && <HeroStat label={k.Unit} value={stats.units} />}
          {!fixedPlace && <HeroStat label="Koordinatlı" value={`${coordPercent(stats.coords, stats.units)}%`} />}
          <HeroStat label="Bu ay iş" value={stats.monthWorks} tone="text-frost" />
          <HeroStat label="Son iş" value={stats.lastWork ? shortDateAz(stats.lastWork) : "—"} />
        </dl>

        {/* Bütün obyektin (özü + filialları/mağazaları) iş tarixçəsi */}
        <PlaceHistoryButton target={{ title: company.name, companyId: company.id }}
          className="btn shrink-0 !bg-white/10 !text-white ring-1 ring-white/15 hover:!bg-white/20 max-sm:w-full max-sm:!h-9 sm:max-lg:ml-auto" />
      </div>
      {company.notes && (
        <p className="mt-4 flex items-start gap-2 border-t border-white/10 pt-3 text-sm text-white/70">
          <StickyNote size={15} className="mt-0.5 shrink-0 text-white/40" />{company.notes}
        </p>
      )}
    </section>
  );
}
