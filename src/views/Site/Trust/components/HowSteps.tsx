import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { STEPS } from "@/components/landing/content";
import { Reveal } from "@/components/landing/Reveal";
import type { TextsProps } from "@/types/site";
import { HowStepCard } from "./HowStepCard";

// Necə işləyirik: 3 addım, aralarında bağlayıcı xətt (mətnlər bazadan: "how.step*")
export function HowSteps({ t }: TextsProps) {
  return (
    <section className="bg-glacier py-20">
      <div className="site-wrap">
        <Reveal>
          <div className="mx-auto max-w-2xl text-center lg:max-w-3xl">
            <span className="mx-auto block h-1 w-12 rounded-full bg-cold" aria-hidden="true" />
            <h2 className="mt-4 text-balance font-display text-[clamp(1.4rem,6.9vw,1.875rem)] font-bold sm:text-4xl">{t["home.how.title"]}</h2>
            <p className="mt-3 text-night/60">{t["home.how.lead"]}</p>
          </div>
        </Reveal>
        {/* Addımları birləşdirən xətt səhifə sürüşdükcə dolur, addımlar növbə ilə işıqlanır (CSS scroll-driven: .steps-line, .step-dot) */}
        {/* Alt-alta düzüləndə (< 768) boşluq ikon dairəsinin yarısından böyükdür: dairə yuxarıdakı karta toxunmur */}
        <ol className="steps relative mt-14 grid gap-12 md:grid-cols-3 md:gap-6">
          <span className="pointer-events-none absolute left-[16.6%] right-[16.6%] top-9 hidden h-[3px] rounded-full bg-cold/15 md:block" aria-hidden="true">
            <span className="steps-line block h-full rounded-full bg-gradient-to-r from-cold to-[#4fd1ff]" />
          </span>
          {STEPS.map((step, i) => <HowStepCard key={step.title} step={step} index={i} t={t} />)}
        </ol>
        <Reveal className="mt-10 text-center">
          {/* Planşet və mobildə tam endə (istifadəçi qərarı) */}
          <Link href="/nece-isleyirik" className="inline-flex h-12 items-center gap-2 rounded-full bg-cold px-6 font-bold text-white transition-colors hover:bg-night max-lg:w-full max-lg:justify-center">
            {t["home.how.button"]} <ArrowRight size={18} />
          </Link>
        </Reveal>
      </div>
    </section>
  );
}
