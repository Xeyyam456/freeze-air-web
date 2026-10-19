import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { DELIVERABLES, STEPS } from "@/components/landing/content";
import { PageIntro } from "@/components/landing/PageIntro";
import { Reveal } from "@/components/landing/Reveal";
import { Spotlight } from "@/components/landing/Spotlight";
import { getTexts, pageTitle } from "@/lib/site-texts";

export async function generateMetadata(): Promise<Metadata> {
  return { title: await pageTitle("how.title") };
}

export default async function HowWeWorkPage() {
  const t = await getTexts();
  return (
    <>
      <PageIntro title={t["how.title"]} lead={t["how.lead"]} />

      {/* Addımlar ardıcıllıqdır: solda şaquli zaman xətti, düyündə addımın nömrəsi; sağda tam enli kart (ikon, ad, izah).
          Xətt sürüşdükcə dolur, düyünlər növbə ilə işıqlanır (.timeline, .timeline-fill, .tl-node: motion.css).
          Bəyənilmədi: zigzag (bir tərəf boş qalırdı) və nömrə üçün ayrıca kart / iri nömrə. */}
      <section className="site-wrap">
        <ol className="timeline relative">
          <span className="pointer-events-none absolute bottom-16 left-9 top-16 w-[3px] -translate-x-1/2 rounded-full bg-cold/15" aria-hidden="true">
            <span className="timeline-fill block h-full rounded-full bg-gradient-to-b from-cold to-[#4fd1ff]" />
          </span>
          {STEPS.map(({ icon: Icon, title, text }, i) => (
            <li key={title} className="relative grid grid-cols-[72px_1fr] items-center gap-6 py-3 md:gap-10">
              <span className="tl-node relative z-10 grid h-[72px] w-[72px] place-items-center rounded-full bg-white font-display text-xl font-bold text-cold ring-8 ring-glacier">
                0{i + 1}
              </span>
              <Reveal delay={80}>
                <Spotlight className="rounded-[28px]">
                  <div className="group flex items-center gap-8 rounded-[28px] bg-white p-8 shadow-[0_1px_2px_rgba(6,25,43,0.04)] ring-1 ring-night/5 transition-[box-shadow,transform] duration-300 hover:-translate-y-1 hover:shadow-[0_24px_50px_rgba(6,25,43,0.1)] sm:p-10">
                    <span className="grid h-20 w-20 shrink-0 place-items-center rounded-3xl bg-gradient-to-br from-cold to-[#0077b6] text-white shadow-[0_14px_30px_rgba(0,163,217,0.35)] transition-transform duration-300 group-hover:-rotate-6">
                      <Icon size={34} />
                    </span>
                    <div className="min-w-0">
                      <h2 className="font-display text-2xl font-bold leading-tight sm:text-3xl">{t[title]}</h2>
                      <p className="mt-2 text-lg text-night/60">{t[text]}</p>
                    </div>
                  </div>
                </Spotlight>
              </Reveal>
            </li>
          ))}
        </ol>
      </section>

      {/* Hər işdən sonra əlinizdə: tünd aurora fonda üç şüşə kart */}
      <section className="site-wrap pt-16">
        <div className="aurora relative overflow-hidden rounded-[32px] bg-night p-8 text-white sm:p-12">
          <Reveal>
            <h2 className="font-display text-3xl font-bold sm:text-4xl">{t["how.deliverables"]}</h2>
          </Reveal>
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {DELIVERABLES.map(({ icon: Icon, title, text }, i) => (
              <Reveal key={title} delay={i * 100} className="h-full">
                <Spotlight className="h-full rounded-[24px]">
                  <div className="bento-card h-full rounded-[24px] p-7">
                    <span className="grid h-14 w-14 place-items-center rounded-2xl bg-cold/15 text-cold ring-1 ring-cold/30"><Icon size={26} /></span>
                    <h3 className="mt-6 font-display text-xl font-bold">{t[title]}</h3>
                    <p className="mt-2 text-white/65">{t[text]}</p>
                  </div>
                </Spotlight>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Çağırış (Xidmətlər səhifəsindəki ilə eyni mətn və üslub) */}
      <section className="site-wrap pt-6">
        <Reveal>
          <div className="glow-border relative flex flex-wrap items-center justify-between gap-6 overflow-hidden rounded-[32px] bg-white px-10 py-10 ring-1 ring-night/5">
            <p className="max-w-2xl font-display text-2xl font-bold leading-snug">{t["services.cta_text"]}</p>
            <Link href="/elaqe" className="inline-flex h-12 items-center gap-2 rounded-full bg-night px-7 font-bold text-white transition-all hover:-translate-y-px hover:bg-cold">
              {t["services.cta_button"]} <ArrowRight size={18} />
            </Link>
          </div>
        </Reveal>
      </section>
    </>
  );
}
