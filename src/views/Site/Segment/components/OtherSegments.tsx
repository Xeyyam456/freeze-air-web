import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { SegmentVisual } from "@/components/landing/SegmentVisual";
import { Spotlight } from "@/components/landing/Spotlight";
import type { OtherSegmentsProps } from "@/types/site";

// Digər obyekt növləri: Xidmətlər səhifəsindəki kimi şəkilli kartlar, ad və izah şəklin üstündə.
// ≥ 1024 üç sütun; planşetdə və mobildə alt-alta enli kartlar (üç sütunda ad 13px-ə düşürdü)
export function OtherSegments({ others, t }: OtherSegmentsProps) {
  if (others.length === 0) return null;
  return (
    <section className="site-wrap mt-14">
      <h2 className="font-display text-2xl font-bold max-sm:text-center">{t["segment.others"]}</h2>
      <div className="mt-6 grid gap-5 lg:grid-cols-3">
        {others.map((o) => (
          <Spotlight key={o.id} className="rounded-[28px]">
            <Link href={`/xidmetler/${o.slug}`} className="group relative block aspect-[16/10] overflow-hidden rounded-[28px] bg-night sm:max-lg:aspect-[3/1]">
              <SegmentVisual segment={o} className="transition-transform duration-700 group-hover:scale-110" />
              <span className="absolute inset-0 bg-gradient-to-t from-night via-night/40 to-transparent" aria-hidden="true" />
              {/* Ad bir sətirdə (şrift kartın eninə görə), izah həmişə 2 sətir yer tutur: başlıqlar bir xətdə qalır.
                  Ox düyməsi yuxarı sağ küncdə, mətn bütün eni tutur */}
              <span className="@container absolute inset-x-0 bottom-0 p-6 text-white">
                <span className="block font-display text-[min(1.125rem,calc(100cqi/13.2))] font-bold">{o.title}</span>
                {o.summary && <span className="mt-1 line-clamp-2 min-h-[2lh] text-sm text-white/70">{o.summary}</span>}
              </span>
              <span className="absolute right-5 top-5 grid h-10 w-10 place-items-center rounded-full bg-white/15 text-white ring-1 ring-white/25 backdrop-blur-md transition-all duration-300 group-hover:rotate-45 group-hover:bg-cold group-hover:ring-cold">
                <ArrowUpRight size={18} />
              </span>
            </Link>
          </Spotlight>
        ))}
      </div>
    </section>
  );
}
