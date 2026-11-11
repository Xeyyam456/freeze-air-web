import s from "../styles/HowSteps.module.css";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { STEPS } from "@/components/landing/content";
import { Reveal } from "@/components/landing/Reveal";
import type { TextsProps } from "@/types/site";
import { HowStepCard } from "./HowStepCard";

// Necə işləyirik: 3 addım (mətnlər bazadan: "how.step*"). Tünd yuvarlaq panel: yanlardan boşluq, ətrafı çox açıq
// gradient (qonşu bölmələrə boz keçid yoxdur); içində yuxarıda firuzəyi parıltı (statik gradient, animasiya yox).
// Addımları birləşdirən xətt silinib (kartların kənarını kəsirdi); addım nöqtələri scroll ilə növbə ilə işıqlanır (.dot).
export function HowSteps({ t }: TextsProps) {
  return (
    <section className="bg-gradient-to-b from-glacier to-white px-3 py-8 sm:px-6 sm:py-12">
      <div className="relative overflow-hidden rounded-[36px] bg-night bg-[radial-gradient(60%_70%_at_50%_0%,rgba(0,163,217,0.22),transparent_72%)] py-20 text-white shadow-[0_40px_100px_rgba(6,25,43,0.28)] sm:rounded-[52px] sm:py-24">
        <div className="site-wrap relative">
          <Reveal>
            <div className="mx-auto max-w-2xl text-center lg:max-w-3xl">
              <span className="mx-auto block h-1 w-12 rounded-full bg-cold" aria-hidden="true" />
              <h2 className="mt-4 text-balance font-display text-[clamp(1.4rem,6.9vw,1.875rem)] font-bold sm:text-4xl">{t["home.how.title"]}</h2>
              <p className="mt-3 text-white/65">{t["home.how.lead"]}</p>
            </div>
          </Reveal>
          {/* Alt-alta düzüləndə (< 768) boşluq ikon dairəsinin yarısından böyükdür: dairə yuxarıdakı karta toxunmur */}
          <ol className={`${s.steps} relative mt-14 grid gap-12 md:grid-cols-3 md:gap-6`}>
            {STEPS.map((step, i) => <HowStepCard key={step.title} step={step} index={i} t={t} />)}
          </ol>
          <Reveal className="mt-10 text-center">
            {/* Planşet və mobildə tam endə (istifadəçi qərarı) */}
            <Link href="/nece-isleyirik" className="inline-flex h-12 items-center gap-2 rounded-full bg-cold px-6 font-bold text-white transition-colors hover:bg-white hover:text-night max-lg:w-full max-lg:justify-center">
              {t["home.how.button"]} <ArrowRight size={18} />
            </Link>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
