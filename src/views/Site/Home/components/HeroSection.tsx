import Link from "next/link";
import { Suspense } from "react";
import { ArrowRight, Snowflake, Sun } from "lucide-react";
import { HeroTitle } from "@/components/landing/HeroTitle";
import type { TextsProps } from "@/types/site";
import { HeroBackground } from "./HeroBackground";
import { HeroForm } from "./HeroForm";

const LINK = "inline-flex items-center gap-1.5 text-white/85 underline-offset-4 transition-colors hover:text-white hover:underline";

// Hero banner
export function HeroSection({ t }: TextsProps) {
  return (
    <section className="relative grid overflow-hidden bg-gradient-to-br from-night via-[#0b3a5c] to-cold text-white">
      <Suspense fallback={null}>
        <HeroBackground />
      </Suspense>
      <div className="pointer-events-none absolute inset-0 bg-[repeating-linear-gradient(90deg,rgba(255,255,255,0.04)_0_1px,transparent_1px_32px)]" aria-hidden="true" />
      {/* < 1024: mətn aşağıda, şəklin yuxarısındakı kondisioner açıq qalır */}
      <div className="site-wrap relative col-start-1 row-start-1 w-full self-center pb-24 pt-16 max-lg:self-end">
        <div className="max-w-2xl">
          <div className="hero-in flex flex-wrap gap-2 text-sm font-semibold">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-heat/20 px-3 py-1.5 text-[#ffd08a]"><Sun size={15} /> {t["home.hero.badge_out"]}</span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1.5 text-ice"><Snowflake size={15} /> {t["home.hero.badge_in"]}</span>
          </div>
          <HeroTitle text={t["home.hero.title"]} className="mt-6 text-balance font-display text-4xl font-bold leading-[1.05] sm:text-5xl lg:text-6xl" />
          <p className="hero-in mt-5 max-w-xl text-lg text-white/75" style={{ "--d": "420ms" } as React.CSSProperties}>
            {t["home.hero.lead"]}
          </p>
          <div className="hero-in" style={{ "--d": "520ms" } as React.CSSProperties}>
            <Suspense fallback={<div className="mt-9 h-[68px] max-w-xl rounded-[28px] bg-white/10" aria-hidden="true" />}>
              <HeroForm t={t} />
            </Suspense>
            <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm font-bold">
              <Link href="/elaqe" className={LINK}>{t["home.hero.cta"]} <ArrowRight size={15} /></Link>
              <Link href="/xidmetler" className={LINK}>{t["home.hero.cta2"]} <ArrowRight size={15} /></Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
