import type { SegmentCardsProps } from "@/types/site";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getSegments } from "@/services/site/fetchSiteContent.server";
import { getTexts } from "@/services/site/fetchSiteTexts.server";
import { SegmentVisual } from "../SegmentVisual";
import { tone } from "../tones";
import { Spotlight } from "../Spotlight";

// Obyekt növlərinin kartları (bazadan): ana səhifədə ətraflı, Xidmətlər səhifəsində yığcam.
// Ətraflı kartlar subgrid-dir (şəkil / başlıq / izah / keçid = 4 ortaq sətir): bir sırada başlıqlardan biri
// iki sətrə düşəndə qonşuların da başlıq sahəsi böyüyür, izahlar və "Ətraflı" bir xətdə qalır.
const subgrid = "row-span-4 grid grid-rows-subgrid gap-y-0";

export async function SegmentCards({ compact = false }: SegmentCardsProps) {
  const [segments, t] = await Promise.all([getSegments(), getTexts()]);

  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
      {segments.map((s, i) => (
        <Spotlight key={s.id} className={`rounded-[28px] ${compact ? "" : subgrid}`}>
        {/* --tone: növün rəngi (üst zolaq, "Ətraflı", hover kölgəsi və haşiyəsi) */}
        <Link href={`/xidmetler/${s.slug}`} style={tone(i)}
          className={`group relative h-full overflow-hidden rounded-[28px] bg-white transition-[box-shadow,transform,border-color] duration-300 hover:-translate-y-1 hover:shadow-[0_24px_60px_color-mix(in_srgb,var(--tone)_26%,transparent)] ${compact ? "block" : `border border-night/10 hover:border-[color-mix(in_srgb,var(--tone)_45%,transparent)] ${subgrid}`}`}>
          <span className="absolute inset-x-0 top-0 z-10 h-1 bg-(--tone)" aria-hidden="true" />
          <div className={`overflow-hidden ${compact ? "h-40" : "h-48"}`}>
            <SegmentVisual segment={s} className="transition-transform duration-700 group-hover:scale-110" />
          </div>
          {compact ? (
            <div className="flex items-center justify-between gap-3 p-5">
              <span className="font-display font-bold">{s.title}</span>
              <ArrowRight size={18} className="shrink-0 text-(--tone) transition-transform group-hover:translate-x-1" />
            </div>
          ) : (
            <>
              <h3 className="px-6 pt-6 font-display text-lg font-bold">{s.title}</h3>
              <p className="px-6 pt-2 text-sm text-night/60">{s.summary}</p>
              <span className="inline-flex items-center gap-1.5 self-end justify-self-start px-6 pb-6 pt-4 text-sm font-bold text-(--tone)">{t["home.segments.more"]} <ArrowRight size={15} /></span>
            </>
          )}
        </Link>
        </Spotlight>
      ))}
    </div>
  );
}

// Yüklənərkən kartların yeri
export function SegmentCardsSkeleton() {
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
      {[0, 1, 2, 3].map((i) => <div key={i} className="h-72 rounded-[28px] bg-glacier" />)}
    </div>
  );
}
