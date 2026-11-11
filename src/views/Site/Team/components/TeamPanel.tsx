import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { CountUp } from "@/components/landing/CountUp";
import { Reveal } from "@/components/landing/Reveal";
import type { TeamPanelProps } from "@/types/site";
import { typeTone, WORKER_TYPES } from "../constants/workerTypes";

// Solda yapışan tünd panel: komanda göstəriciləri (usta, köməkçi, sürücü — üçü də həmişə) + çağırış.
// < 1024 panel tam endədir: göstəricilər üç sütunda (ikon, say, ad — mərkəzdə), çağırış mətni mərkəzdə, "Usta çağır" tam endə.
// Təcrübə illərinin cəmi ("41+ il") peşəkar görünmürdü, istifadəçi istəyi ilə çıxarıldı.
export function TeamPanel({ t, counts }: TeamPanelProps) {
  return (
    <Reveal className="lg:sticky lg:top-24">
      <aside className="glow-border aurora relative overflow-hidden rounded-[32px] bg-night bg-[radial-gradient(70%_35%_at_100%_100%,rgba(255,159,28,0.16),transparent)] p-8 text-white max-sm:p-5">
        <dl className="grid gap-3 sm:max-lg:grid-cols-3">
          {WORKER_TYPES.map(({ key, icon: Icon }) => (
            <div key={key} style={typeTone(key)} className="flex items-center gap-4 rounded-[20px] bg-[linear-gradient(100deg,color-mix(in_srgb,var(--tone)_22%,transparent),rgba(255,255,255,0.05))] p-4 ring-1 ring-[color-mix(in_srgb,var(--tone)_35%,transparent)] sm:max-lg:flex-col sm:max-lg:gap-2 sm:max-lg:py-5">
              <span className="grid h-11 w-11 place-items-center rounded-2xl bg-[linear-gradient(135deg,var(--tone),color-mix(in_srgb,var(--tone)_55%,#06192b))] text-white shadow-[0_8px_20px_color-mix(in_srgb,var(--tone)_45%,transparent)] ring-1 ring-white/20"><Icon size={20} /></span>
              <dt className="flex-1 text-white/70 sm:max-lg:order-last sm:max-lg:flex-none">{t[`team.type.${key}`]}</dt>
              <dd className="font-display text-3xl font-bold text-white drop-shadow-[0_0_12px_color-mix(in_srgb,var(--tone)_60%,transparent)]"><CountUp value={String(counts[key])} /></dd>
            </div>
          ))}
        </dl>
        <p className="mt-8 text-balance font-display text-2xl font-bold leading-snug max-lg:text-center max-sm:mt-6 max-sm:text-xl">{t["team.cta_text"]}</p>
        <Link href="/elaqe" className="mt-6 inline-flex h-12 items-center justify-center gap-2 rounded-full bg-gradient-to-r from-cold to-primary px-7 font-bold shadow-[0_12px_28px_rgba(0,163,217,0.4)] transition-all hover:-translate-y-px hover:shadow-[0_16px_34px_rgba(31,111,235,0.5)] max-lg:w-full max-sm:mt-5">
          {t["team.cta_button"]} <ArrowRight size={18} />
        </Link>
      </aside>
    </Reveal>
  );
}
