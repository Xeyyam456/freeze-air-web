import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ServiceIcon } from "@/components/landing/icons";
import { Spotlight } from "@/components/landing/Spotlight";
import { tone } from "@/components/landing/tones";
import type { OtherServicesProps } from "@/types/site";

// Digər xidmətlər. Kart sayı sütun sayına bölünməyəndə natamam son sıra bütün eni tutur (flex-grow): 5 xidmət → 3 + 2 yarı-yarı, planşetdə 2+2+1 (sonuncu tam en).
// Son sıranı mərkəzdə saxlamaq (sabit en) sınandı — kartlar ortada tək qalırdı, bəyənilmədi.
// Kartda ad bir sətirdə (şrift enə görə), izah həmişə 2 sətir yer tutur, "Ətraflı" altda — qonşu kartlarla bir xətdə
export function OtherServices({ others, t }: OtherServicesProps) {
  if (others.length === 0) return null;
  return (
    <section className="site-wrap mt-14">
      <h2 className="font-display text-2xl font-bold max-sm:text-center sm:text-3xl">{t["service.others"]}</h2>
      <div className="mt-6 flex flex-wrap gap-4">
        {others.map((o, i) => (
          // 640–767 bir sütun (iki sütunda ad 13px-ə düşürdü), ≥ 768 iki, ≥ 1024 üç
          <Spotlight key={o.id} className="w-full rounded-[24px] md:w-auto md:grow md:basis-[calc((100%-1rem)/2)] lg:basis-[calc((100%-2rem)/3)]">
            <Link href={`/xidmet/${o.slug}`} style={tone(i)}
              className="group flex h-full items-start gap-4 rounded-[24px] bg-white bg-[radial-gradient(90%_60%_at_0%_0%,color-mix(in_srgb,var(--tone)_10%,transparent),transparent)] p-6 ring-1 ring-night/5 transition-[box-shadow,transform] duration-300 hover:-translate-y-1 hover:shadow-[0_20px_44px_color-mix(in_srgb,var(--tone)_26%,transparent)] hover:ring-[color-mix(in_srgb,var(--tone)_40%,transparent)] max-sm:gap-3 max-sm:p-5">
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-[linear-gradient(135deg,var(--tone),color-mix(in_srgb,var(--tone)_55%,#06192b))] text-white shadow-[0_8px_20px_color-mix(in_srgb,var(--tone)_40%,transparent)] transition-transform group-hover:-rotate-6 max-sm:h-10 max-sm:w-10 max-sm:rounded-xl">
                <ServiceIcon name={o.icon} size={22} />
              </span>
              <span className="@container flex min-w-0 flex-1 flex-col self-stretch">
                <span className="block font-display text-[min(1rem,calc(100cqi/13.6))] font-bold">{o.title}</span>
                {o.text && <span className="mt-1 line-clamp-2 min-h-[2lh] text-sm text-night/60">{o.text}</span>}
                <span className="mt-auto inline-flex items-center gap-1 pt-3 text-sm font-bold text-(--tone)">
                  {t["service.more"]} <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
                </span>
              </span>
            </Link>
          </Spotlight>
        ))}
      </div>
    </section>
  );
}
