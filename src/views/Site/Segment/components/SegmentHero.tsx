import Link from "next/link";
import { ArrowRight, CircleCheck } from "lucide-react";
import { Reveal } from "@/components/landing/Reveal";
import type { SegmentBlockProps } from "@/types/site";

// Solda şəkil öz nisbətində (kəsilmir), sağda qısa məlumat və çağırış.
// Məlumat kartı şəkildən hündür olanda (1024–1279) şəkil xananı doldurur (yanlardan azca kəsilir), altında boşluq qalmır
export function SegmentHero({ segment, equipment, t }: SegmentBlockProps) {
  if (!segment.image_url) return null;
  return (
    <section className="site-wrap mb-14 grid items-stretch gap-4 lg:grid-cols-[1.5fr_1fr]">
      <Reveal className="reveal-wipe">
        <div className="overflow-hidden rounded-[32px] bg-white lg:h-full">
          {/* eslint-disable-next-line @next/next/no-img-element -- storage şəkli */}
          <img src={segment.image_url} alt={segment.title} className="block h-auto w-full lg:h-full lg:object-cover" />
        </div>
      </Reveal>
      {/* ≥ 1024: şəklin yanında sütun (həblər + düymə aşağıda). < 1024 hər şey alt-alta, düymə tam endə.
          Planşetdə iki sütun sınandı (sağda həblər + düymə aşağıda) — üstündə boş yer qalırdı, bəyənilmədi. */}
      <div className="glow-border aurora relative flex flex-col overflow-hidden rounded-[32px] bg-night p-8 text-white max-sm:p-6">
        <div>
          <p className="font-semibold text-cold">{segment.title}</p>
          {segment.summary && <h2 className="mt-2 text-balance font-display text-2xl font-bold leading-tight max-sm:text-xl">{segment.summary}</h2>}
        </div>
        {segment.work.length > 0 && (
          <ul className="mt-6 space-y-3 max-sm:mt-5">
            {segment.work.slice(0, 3).map((w) => (
              <li key={w} className="flex items-start gap-3 text-white/80">
                <CircleCheck size={20} className="mt-0.5 shrink-0 text-cold" /> <span>{w}</span>
              </li>
            ))}
          </ul>
        )}
        {/* Həblər + düymə bir qrup: həmişə kartın altında, araları hər ölçüdə 16px (əvvəl ölçüyə görə ya yapışırdı, ya aralanırdı) */}
        <div className="flex flex-col pt-6 max-sm:pt-0 lg:mt-auto">
          {equipment.length > 0 && (
            // Həblər "Tipik avadanlıq"ın təkrarıdır: dar kartda (mobil, 1024–1279) iki sətrə bölünürdü → orada gizli
            <div className="flex flex-wrap gap-2 max-sm:hidden lg:max-xl:hidden">
              {equipment.map((e) => (
                <span key={e.id} className="rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold text-white/80 ring-1 ring-white/15">{e.title}</span>
              ))}
            </div>
          )}
          <Link href="/elaqe" className="mt-4 inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-cold px-6 font-bold text-white transition-colors hover:bg-white hover:text-night max-sm:mt-6">
            {t["segment.cta"]} <ArrowRight size={18} />
          </Link>
        </div>
      </div>
    </section>
  );
}
