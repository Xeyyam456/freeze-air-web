import { Reveal } from "@/components/landing/Reveal";
import type { HowStepCardProps } from "@/types/site";

// Sütunlarda subgrid (başlıq / mətn = 2 ortaq sətir): bir başlıq iki sətrə düşəndə mətnlər yenə bir xətdən başlayır
export const STEP_GRID = "md:row-span-2 md:grid md:grid-rows-subgrid md:gap-y-0";

export function HowStepCard({ step: { icon: Icon, title, text }, index, t }: HowStepCardProps) {
  return (
    <li className={STEP_GRID}>
      <Reveal delay={index * 120} className={`h-full ${STEP_GRID}`}>
        <div className="group relative h-full rounded-[28px] bg-white p-7 pt-14 text-center shadow-[0_1px_2px_rgba(6,25,43,0.04)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_24px_50px_rgba(6,25,43,0.1)] md:row-span-2 md:grid md:grid-rows-subgrid md:gap-y-2">
          <span className="step-dot absolute left-1/2 top-0 grid h-[72px] w-[72px] -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-cold text-white shadow-[0_12px_30px_rgba(0,163,217,0.4)] ring-8 ring-glacier">
            <Icon size={28} />
          </span>
          <div>
            <span className="font-display text-sm font-bold text-cold">0{index + 1}</span>
            <h3 className="mt-1 font-display text-lg font-bold">{t[title as keyof typeof t]}</h3>
          </div>
          <p className="mt-2 text-night/60 md:mt-0">{t[text as keyof typeof t]}</p>
        </div>
      </Reveal>
    </li>
  );
}
