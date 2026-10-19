import Link from "next/link";
import { ArrowRight, Plus } from "lucide-react";
import { getFaq, getStats } from "@/lib/site-trust";
import type { Texts } from "@/lib/site-texts";
import { SITE_URL } from "@/lib/site-url";
import { STEPS } from "./content";
import { CountUp } from "./CountUp";
import { Reveal } from "./Reveal";

// Rəqəmlər zolağı: hero-nun üstünə yarı çıxan ağ kart. Ən azı 2 aktiv rəqəm olanda göstərilir.
export async function StatsStrip() {
  const stats = (await getStats()).slice(0, 4);
  if (stats.length < 2) return null;
  const cols = { 2: "lg:grid-cols-2", 3: "lg:grid-cols-3", 4: "lg:grid-cols-4" }[stats.length as 2 | 3 | 4];
  return (
    <div className="site-wrap relative z-10 -mt-12 lg:-mt-14">
      {/* Şüşə kart: hero-nun üstündə bulanıq ağ; hər rəqəmin altında sayğacla birlikdə dolan xətt (.stat-bar) */}
      <div className="hero-in rounded-[28px] bg-white/80 p-3 shadow-[0_24px_60px_rgba(6,25,43,0.18)] ring-1 ring-white/60 backdrop-blur-xl" style={{ "--d": "700ms" } as React.CSSProperties}>
        <dl className={`grid grid-cols-2 gap-y-2 ${cols}`}>
          {stats.map((s, i) => (
            <div key={s.id} className={`flex flex-col items-center px-6 py-5 text-center ${i > 0 ? "lg:border-l lg:border-night/10" : ""}`}>
              <dt className="order-3 mt-1.5 text-sm font-semibold text-night/55">{s.label}</dt>
              <dd className="font-display text-3xl font-bold text-cold sm:text-4xl"><CountUp value={s.value} /></dd>
              <span className="stat-bar order-2 mt-2" style={{ "--d": `${900 + i * 150}ms` } as React.CSSProperties} aria-hidden="true" />
            </div>
          ))}
        </dl>
      </div>
    </div>
  );
}

// Necə işləyirik: 3 addım, aralarında bağlayıcı xətt (mətnlər bazadan: "how.step*")
export function HowSteps({ t }: { t: Texts }) {
  return (
    <section className="bg-glacier py-20">
      <div className="site-wrap">
        <Reveal>
          <div className="mx-auto max-w-2xl text-center">
            <span className="mx-auto block h-1 w-12 rounded-full bg-cold" aria-hidden="true" />
            <h2 className="mt-4 font-display text-3xl font-bold sm:text-4xl">{t["home.how.title"]}</h2>
            <p className="mt-3 text-night/60">{t["home.how.lead"]}</p>
          </div>
        </Reveal>
        {/* Addımları birləşdirən xətt səhifə sürüşdükcə dolur, addımlar növbə ilə işıqlanır (CSS scroll-driven: .steps-line, .step-dot) */}
        <ol className="steps relative mt-14 grid gap-6 lg:grid-cols-3">
          <span className="pointer-events-none absolute left-[16.6%] right-[16.6%] top-9 hidden h-[3px] rounded-full bg-cold/15 lg:block" aria-hidden="true">
            <span className="steps-line block h-full rounded-full bg-gradient-to-r from-cold to-[#4fd1ff]" />
          </span>
          {STEPS.map(({ icon: Icon, title, text }, i) => (
            <li key={title}>
              <Reveal delay={i * 120} className="h-full">
                <div className="group relative h-full rounded-[28px] bg-white p-7 pt-14 text-center shadow-[0_1px_2px_rgba(6,25,43,0.04)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_24px_50px_rgba(6,25,43,0.1)]">
                  <span className="step-dot absolute left-1/2 top-0 grid h-[72px] w-[72px] -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-cold text-white shadow-[0_12px_30px_rgba(0,163,217,0.4)] ring-8 ring-glacier">
                    <Icon size={28} />
                  </span>
                  <span className="font-display text-sm font-bold text-cold">0{i + 1}</span>
                  <h3 className="mt-1 font-display text-lg font-bold">{t[title]}</h3>
                  <p className="mt-2 text-night/60">{t[text]}</p>
                </div>
              </Reveal>
            </li>
          ))}
        </ol>
        <Reveal className="mt-10 text-center">
          <Link href="/nece-isleyirik" className="inline-flex h-12 items-center gap-2 rounded-full bg-cold px-6 font-bold text-white transition-colors hover:bg-night">
            {t["home.how.button"]} <ArrowRight size={18} />
          </Link>
        </Reveal>
      </div>
    </section>
  );
}

// Tez-tez verilən suallar: <details> (JS-siz işləyir), Google üçün FAQPage işarələməsi; siyahı boşdursa bölmə yoxdur
export async function FaqSection({ t }: { t: Texts }) {
  const faq = await getFaq();
  if (faq.length === 0) return null;
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    url: SITE_URL,
    mainEntity: faq.map((f) => ({ "@type": "Question", name: f.question, acceptedAnswer: { "@type": "Answer", text: f.answer } })),
  };
  return (
    // Tam en: yuxarıda başlıq (solda) və "Bizə yazın" (sağda), altında suallar bütün eni tutur; hamısı bağlı açılır
    // (istifadəçi: iki sütuna bölünmə, ortada dar sütun və açıq ilk sual bəyənilmədi)
    <section className="site-wrap py-20">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <Reveal>
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <span className="block h-1 w-12 rounded-full bg-cold" aria-hidden="true" />
            <h2 className="mt-4 font-display text-3xl font-bold leading-tight sm:text-4xl">{t["home.faq.title"]}</h2>
            <p className="mt-3 text-night/60">{t["home.faq.lead"]}</p>
          </div>
          <Link href="/elaqe" className="inline-flex h-12 items-center gap-2 rounded-full border border-night/15 px-6 font-bold transition-colors hover:border-night hover:bg-night hover:text-white">
            {t["home.faq.button"]} <ArrowRight size={18} />
          </Link>
        </div>
      </Reveal>
      <Reveal delay={120}>
        <div className="mt-10 space-y-3">
          {faq.map((f) => (
            <details key={f.id} name="home-faq" className="faq-item group rounded-2xl bg-white shadow-[0_1px_2px_rgba(6,25,43,0.04)] ring-1 ring-night/5 transition-shadow open:shadow-[0_16px_40px_rgba(6,25,43,0.08)]">
              <summary className="flex list-none items-center justify-between gap-4 px-6 py-5 font-display text-base font-bold [&::-webkit-details-marker]:hidden">
                {f.question}
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-glacier text-cold transition-all duration-300 group-open:rotate-45 group-open:bg-cold group-open:text-white">
                  <Plus size={18} />
                </span>
              </summary>
              <p className="faq-answer px-6 pb-6 text-night/65">{f.answer}</p>
            </details>
          ))}
        </div>
      </Reveal>
    </section>
  );
}
