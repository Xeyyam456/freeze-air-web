import { EquipmentVisual } from "@/components/landing/EquipmentVisual";
import { Reveal } from "@/components/landing/Reveal";
import { Spotlight } from "@/components/landing/Spotlight";
import { tone } from "@/components/landing/tones";
import type { EquipmentCardsProps } from "@/types/site";

// Tipik avadanlıq: ≥ 1024 üç sütun; planşetdə üç sütun çox dar idi (ad 2 sətir) → üfüqi kartlar: solda şəkil, sağda mətn
export function EquipmentCards({ equipment, t }: EquipmentCardsProps) {
  if (equipment.length === 0) return null;
  return (
    <section className="site-wrap">
      <h2 className="font-display text-2xl font-bold max-sm:text-center sm:text-3xl">{t["segment.equipment"]}</h2>
      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        {equipment.map((e, i) => (
          <Reveal key={e.id} delay={i * 90} className="h-full">
            <Spotlight className="h-full rounded-[28px]">
              <div style={tone(i + 1)} className="group h-full overflow-hidden rounded-[28px] bg-white ring-1 ring-night/5 transition-[box-shadow,transform] duration-300 hover:-translate-y-1 hover:shadow-[0_24px_50px_color-mix(in_srgb,var(--tone)_26%,transparent)] hover:ring-[color-mix(in_srgb,var(--tone)_40%,transparent)] sm:max-lg:flex">
                <div className="relative aspect-video overflow-hidden sm:max-lg:aspect-auto sm:max-lg:min-h-40 sm:max-lg:w-2/5 sm:max-lg:shrink-0"><EquipmentVisual item={e} className="transition-transform duration-700 group-hover:scale-105" /><span className="absolute left-3 top-3 grid h-8 min-w-8 place-items-center rounded-full bg-(--tone) px-2.5 text-xs font-bold text-white shadow-[0_6px_16px_color-mix(in_srgb,var(--tone)_55%,transparent)] ring-1 ring-white/40">0{i + 1}</span></div>
                <div className="p-6 sm:max-lg:self-center">
                  <h3 className="font-display text-lg font-bold">{e.title}</h3>
                  <p className="mt-2 text-sm text-night/60">{e.text}</p>
                </div>
              </div>
            </Spotlight>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
