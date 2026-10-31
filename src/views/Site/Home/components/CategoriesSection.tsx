import { CircleCheck, Snowflake } from "lucide-react";
import { CATEGORIES } from "@/components/landing/content";
import { Reveal } from "@/components/landing/Reveal";
import { Spotlight } from "@/components/landing/Spotlight";
import { lines } from "@/lib/site-texts";
import type { TextsProps } from "@/types/site";
import { SectionTitle } from "./SectionTitle";

// Xidmət kateqoriyaları: tünd "aurora" fonda üç bərabər şüşə kart
export function CategoriesSection({ t }: TextsProps) {
  return (
    <section className="aurora relative overflow-hidden bg-night py-24 text-white">
      <Snowflake size={420} strokeWidth={0.5} className="pointer-events-none absolute -left-24 -top-24 text-white/[0.06]" aria-hidden="true" />
      <div className="site-wrap relative">
        <Reveal>
          <SectionTitle title={t["home.categories.title"]} lead={t["home.categories.lead"]} light />
        </Reveal>
        <div className="mt-12 grid gap-5 lg:grid-cols-3">
          {CATEGORIES.map(({ icon: Icon, title, items }, i) => (
            <Reveal key={title} delay={i * 100} className="h-full">
              <Spotlight className="h-full rounded-[28px]">
                <div className="bento-card h-full rounded-[28px] p-7">
                  <div className="flex items-center gap-4">
                    <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-cold/15 text-cold ring-1 ring-cold/30">
                      <Icon size={26} />
                    </span>
                    <h3 className="font-display text-lg font-bold leading-tight">{t[title]}</h3>
                  </div>
                  {/* Planşetdə kart tam endədir: siyahı 2 sütuna bölünür (ayırıcı xətt hər sütunun ilk bəndində yoxdur) */}
                  <ul className="mt-6 sm:max-lg:grid sm:max-lg:grid-cols-2 sm:max-lg:gap-x-8">
                    {lines(t[items]).map((item) => (
                      <li key={item} className="flex items-center gap-3 border-t border-white/10 py-3 font-medium text-white/85 first:border-t-0 sm:max-lg:nth-2:border-t-0">
                        <CircleCheck size={18} className="shrink-0 text-cold" /> {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </Spotlight>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
