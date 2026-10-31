import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Reveal } from "@/components/landing/Reveal";
import { SegmentVisual } from "@/components/landing/SegmentVisual";
import { Spotlight } from "@/components/landing/Spotlight";
import { getSegments } from "@/lib/site-content";

// Obyekt növləri: hündür şəkilli kartlar, ad və qısa izah şəklin üstündə (tünd keçid üzərində).
// Şəklin hansı hissəsinin görünəcəyini admin seçir (image_position).
export async function SegmentTiles() {
  const segments = await getSegments();
  return (
    // < 1536 dörd sütun çox dar idi (başlıq 9–14px, izah 4 sətir): large-da 2×2 enli kartlar, dörd hündür kart yalnız 2xl-da.
    // < 1024 kartlar 4:3 (4:5 planşetdə çox hündür idi), ox düyməsi yuxarı sağ küncə keçir ki, mətn bütün eni tutsun.
    <div className="grid gap-5 sm:grid-cols-2 2xl:grid-cols-4">
      {segments.map((s, i) => (
        <Reveal key={s.id} delay={i * 90} className="h-full">
          <Spotlight className="h-full rounded-[28px]">
            <Link href={`/xidmetler/${s.slug}`} className="seg-tile group relative block aspect-[4/5] overflow-hidden rounded-[28px] bg-night max-lg:aspect-[4/3] lg:max-2xl:aspect-[16/9]">
              <SegmentVisual segment={s} className="transition-transform duration-700 group-hover:scale-110" />
              <span className="absolute inset-0 bg-gradient-to-t from-night via-night/40 to-transparent" aria-hidden="true" />
              <span className="@container absolute inset-x-0 bottom-0 p-6 text-white max-lg:p-5 lg:pr-[84px]">
                {/* Şrift kartın eninə görə: dar kartda da ən uzun ad ("Stadion və kompleks") bir sətirdə qalsın, başlıqlar bir xətdə olsun */}
                <span className="block font-display text-[min(1.25rem,calc(100cqi/13.2))] font-bold">{s.title}</span>
                {/* İzah həmişə iki sətir yer tutur: bir və iki sətirli kartlarda başlıqlar eyni xətdə qalsın */}
                {s.summary && <span className="mt-1.5 line-clamp-2 min-h-[2lh] text-sm text-white/70">{s.summary}</span>}
              </span>
              <span className="absolute right-5 top-5 grid h-11 w-11 place-items-center rounded-full bg-white/15 text-white ring-1 ring-white/25 backdrop-blur-md transition-all duration-300 group-hover:rotate-45 group-hover:bg-cold group-hover:ring-cold lg:bottom-6 lg:right-6 lg:top-auto">
                <ArrowUpRight size={20} />
              </span>
            </Link>
          </Spotlight>
        </Reveal>
      ))}
    </div>
  );
}
