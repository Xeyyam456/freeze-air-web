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

      {/* Addımlar ardıcıllıqdır: zaman xətti, düyündə addımın nömrəsi. Xətt sürüşdükcə dolur, düyünlər növbə ilə işıqlanır
          (.timeline, .timeline-fill, .tl-node: motion.css).
          ≥ 1024 üfüqi: üç sütun, düyünlər yuxarıda bir xətt üzərində, kartın içi mərkəzdə (tam enli kartlarda sağda 400–1000px boş qalırdı).
          < 1024 şaquli: solda xətt, sağda kart (ikon + ad + izah; mobildə ikon adın üstündə, düyün 48px).
          Kartlar eyni hündürlükdədir (< 1024 `auto-rows-fr`, ≥ 1024 bir sıra). Bəyənilmədi: zigzag, nömrə üçün ayrıca kart / iri nömrə.
          Xəttin ucları düyünlərin mərkəzindədir: sıralar bərabər olduğu üçün mərkəz = (100% − 2 ara) / 6 (3 addım üçün). */}
      <section className="site-wrap">
        <ol className="timeline relative grid auto-rows-fr gap-4 lg:grid-cols-3 lg:gap-6">
          <span className="pointer-events-none absolute bottom-[calc((100%-2rem)/6)] left-9 top-[calc((100%-2rem)/6)] w-[3px] -translate-x-1/2 rounded-full bg-cold/15 max-sm:left-6 lg:bottom-auto lg:left-[calc((100%-3rem)/6)] lg:right-[calc((100%-3rem)/6)] lg:top-9 lg:h-[3px] lg:w-auto lg:translate-x-0 lg:-translate-y-1/2" aria-hidden="true">
            <span className="timeline-fill block h-full rounded-full bg-gradient-to-b from-cold to-[#4fd1ff] lg:bg-gradient-to-r" />
          </span>
          {STEPS.map(({ icon: Icon, title, text }, i) => (
            <li key={title} className="relative grid grid-cols-[72px_1fr] gap-6 max-sm:grid-cols-[48px_1fr] max-sm:gap-4 md:gap-8 lg:flex lg:flex-col lg:gap-6">
              <span className="tl-node relative z-10 grid h-[72px] w-[72px] place-items-center self-center rounded-full bg-white font-display text-xl font-bold text-cold ring-8 ring-glacier max-sm:h-12 max-sm:w-12 max-sm:text-base max-sm:ring-[6px] lg:mx-auto lg:shrink-0">
                0{i + 1}
              </span>
              <Reveal delay={80} className="lg:flex-1">
                <Spotlight className="h-full rounded-[28px]">
                  <div className="group flex h-full items-center gap-6 rounded-[28px] bg-white p-8 shadow-[0_1px_2px_rgba(6,25,43,0.04)] ring-1 ring-night/5 transition-[box-shadow,transform] duration-300 hover:-translate-y-1 hover:shadow-[0_24px_50px_rgba(6,25,43,0.1)] max-sm:flex-col max-sm:items-start max-sm:gap-4 max-sm:p-5 lg:flex-col lg:gap-5 lg:p-8 lg:text-center">
                    <span className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-cold to-[#0077b6] text-white shadow-[0_14px_30px_rgba(0,163,217,0.35)] transition-transform duration-300 group-hover:-rotate-6 max-sm:h-11 max-sm:w-11 max-sm:rounded-xl max-sm:[&>svg]:size-5 xl:h-20 xl:w-20 xl:rounded-3xl">
                      <Icon size={30} />
                    </span>
                    <div className="@container min-w-0 flex-1 max-sm:w-full lg:w-full">
                      {/* Ad bir sətirdə: şrift kartın eninə görə (mobildə və 640-da 2 sətrə düşürdü) */}
                      <h2 className="whitespace-nowrap font-display text-[min(1.5rem,calc(100cqi/12.2))] font-bold leading-tight xl:text-[min(1.75rem,calc(100cqi/12.2))]">{t[title]}</h2>
                      <p className="mt-2 text-balance text-night/60 sm:text-lg">{t[text]}</p>
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
        {/* ≥ 1024 üç sütun (ikon üstdə, izah 2 sətir yer tutur — başlıqlar və mətnlər bir xətdə);
            < 1024 alt-alta üfüqi kartlar (768–1023-də üç sütunda ad 2 sətrə düşürdü) (ikon solda; üstdə ikon olanda kartın sağı boş qalırdı); mobildə başlıq mərkəzdə */}
        <div className="aurora relative overflow-hidden rounded-[32px] bg-night p-8 text-white max-sm:p-5 sm:p-12 sm:max-lg:p-8">
          <Reveal>
            <h2 className="font-display text-3xl font-bold max-sm:text-center max-sm:text-2xl sm:text-4xl">{t["how.deliverables"]}</h2>
          </Reveal>
          <div className="mt-10 grid gap-5 max-lg:mt-6 max-lg:gap-3 lg:grid-cols-3">
            {DELIVERABLES.map(({ icon: Icon, title, text }, i) => (
              <Reveal key={title} delay={i * 100} className="h-full">
                <Spotlight className="h-full rounded-[24px]">
                  <div className="bento-card flex h-full flex-col rounded-[24px] p-7 max-lg:flex-row max-lg:items-center max-lg:gap-4 max-lg:p-5">
                    <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-cold/15 text-cold ring-1 ring-cold/30 max-lg:h-12 max-lg:w-12"><Icon size={26} /></span>
                    <div className="min-w-0">
                      <h3 className="mt-6 font-display text-xl font-bold max-lg:mt-0 max-sm:text-lg">{t[title]}</h3>
                      <p className="mt-2 text-white/65 max-lg:mt-1 max-sm:text-sm lg:min-h-[2lh]">{t[text]}</p>
                    </div>
                  </div>
                </Spotlight>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Çağırış (Xidmətlər səhifəsindəki ilə eyni mətn və üslub): planşetdə düymə sağda bir sırada, mobildə mətn mərkəzdə, düymə tam endə */}
      <section className="site-wrap pt-6">
        <Reveal>
          <div className="glow-border relative flex flex-wrap items-center justify-between gap-6 overflow-hidden rounded-[32px] bg-white px-10 py-10 ring-1 ring-night/5 max-sm:px-6 max-sm:py-8 sm:max-lg:flex-nowrap">
            <p className="max-w-2xl text-balance font-display text-2xl font-bold leading-snug max-sm:w-full max-sm:text-center max-sm:text-xl sm:max-lg:min-w-0 sm:max-lg:text-xl">{t["services.cta_text"]}</p>
            <Link href="/elaqe" className="inline-flex h-12 shrink-0 items-center justify-center gap-2 rounded-full bg-night px-7 font-bold text-white transition-all hover:-translate-y-px hover:bg-cold max-sm:w-full">
              {t["services.cta_button"]} <ArrowRight size={18} />
            </Link>
          </div>
        </Reveal>
      </section>
    </>
  );
}
