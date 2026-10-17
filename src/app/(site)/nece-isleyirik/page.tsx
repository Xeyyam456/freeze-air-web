import type { Metadata } from "next";
import { DELIVERABLES, STEPS } from "@/components/landing/content";
import { PageIntro } from "@/components/landing/PageIntro";
import { getTexts, pageTitle } from "@/lib/site-texts";

export async function generateMetadata(): Promise<Metadata> {
  return { title: await pageTitle("how.title") };
}

export default async function HowWeWorkPage() {
  const t = await getTexts();
  return (
    <>
      <PageIntro title={t["how.title"]} lead={t["how.lead"]} />

      {/* Addımlar: ardıcıllıqdır, ona görə nömrələnir */}
      <section className="site-wrap">
        <ol className="relative grid gap-4 md:grid-cols-3">
          <span className="absolute left-7 right-7 top-[52px] hidden h-0.5 bg-gradient-to-r from-cold via-ice to-cold md:block" aria-hidden="true" />
          {STEPS.map(({ icon: Icon, title, text }, i) => (
            <li key={title} className="relative rounded-[28px] bg-white p-7">
              <div className="flex items-center justify-between">
                <span className="relative z-10 grid h-12 w-12 place-items-center rounded-full bg-night text-white"><Icon size={20} /></span>
                <span className="font-display text-5xl font-bold text-ice">{i + 1}</span>
              </div>
              <h2 className="mt-6 font-display text-xl font-bold">{t[title]}</h2>
              <p className="mt-2 text-night/65">{t[text]}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="site-wrap pt-16">
        <div className="rounded-[32px] bg-night p-8 text-white sm:p-12">
          <h2 className="font-display text-3xl font-bold sm:text-4xl">{t["how.deliverables"]}</h2>
          <div className="mt-10 grid gap-8 md:grid-cols-3">
            {DELIVERABLES.map(({ icon: Icon, title, text }) => (
              <div key={title}>
                <Icon size={28} className="text-cold" />
                <h3 className="mt-4 text-lg font-bold">{t[title]}</h3>
                <p className="mt-1 text-white/60">{t[text]}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
