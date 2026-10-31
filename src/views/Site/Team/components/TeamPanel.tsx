import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { CountUp } from "@/components/landing/CountUp";
import { Reveal } from "@/components/landing/Reveal";
import type { TeamPanelProps } from "@/types/site";
import { WORKER_TYPES } from "../constants/workerTypes";

// Solda yapışan tünd panel: komanda göstəriciləri (usta, köməkçi, sürücü — üçü də həmişə) + çağırış.
// < 1024 panel tam endədir: göstəricilər üç sütunda (ikon, say, ad — mərkəzdə), çağırış mətni mərkəzdə, "Usta çağır" tam endə.
// Təcrübə illərinin cəmi ("41+ il") peşəkar görünmürdü, istifadəçi istəyi ilə çıxarıldı.
export function TeamPanel({ t, counts }: TeamPanelProps) {
  return (
    <Reveal className="lg:sticky lg:top-24">
      <aside className="glow-border aurora relative overflow-hidden rounded-[32px] bg-night p-8 text-white max-sm:p-5">
        <dl className="grid gap-3 sm:max-lg:grid-cols-3">
          {WORKER_TYPES.map(({ key, icon: Icon }) => (
            <div key={key} className="flex items-center gap-4 rounded-[20px] bg-white/[0.06] p-4 ring-1 ring-white/10 sm:max-lg:flex-col sm:max-lg:gap-2 sm:max-lg:py-5">
              <span className="grid h-11 w-11 place-items-center rounded-2xl bg-cold/15 text-cold ring-1 ring-cold/30"><Icon size={20} /></span>
              <dt className="flex-1 text-white/70 sm:max-lg:order-last sm:max-lg:flex-none">{t[`team.type.${key}`]}</dt>
              <dd className="font-display text-3xl font-bold"><CountUp value={String(counts[key])} /></dd>
            </div>
          ))}
        </dl>
        <p className="mt-8 text-balance font-display text-2xl font-bold leading-snug max-lg:text-center max-sm:mt-6 max-sm:text-xl">{t["team.cta_text"]}</p>
        <Link href="/elaqe" className="mt-6 inline-flex h-12 items-center justify-center gap-2 rounded-full bg-cold px-7 font-bold transition-all hover:-translate-y-px hover:bg-white hover:text-night max-lg:w-full max-sm:mt-5">
          {t["team.cta_button"]} <ArrowRight size={18} />
        </Link>
      </aside>
    </Reveal>
  );
}
