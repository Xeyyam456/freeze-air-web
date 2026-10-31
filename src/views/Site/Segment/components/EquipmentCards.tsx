import { EquipmentVisual } from "@/components/landing/EquipmentVisual";
import { Reveal } from "@/components/landing/Reveal";
import { Spotlight } from "@/components/landing/Spotlight";
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
              <div className="group h-full overflow-hidden rounded-[28px] bg-white transition-[box-shadow,transform] duration-300 hover:-translate-y-1 hover:shadow-[0_24px_50px_rgba(6,25,43,0.12)] sm:max-lg:flex">
                <div className="aspect-video overflow-hidden sm:max-lg:aspect-auto sm:max-lg:min-h-40 sm:max-lg:w-2/5 sm:max-lg:shrink-0"><EquipmentVisual item={e} className="transition-transform duration-700 group-hover:scale-105" /></div>
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
