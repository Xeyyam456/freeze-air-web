import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { PageIntro } from "@/components/landing/PageIntro";
import { SegmentCards, SegmentCardsSkeleton } from "@/components/landing/SegmentCards";
import { serviceIcon } from "@/components/landing/icons";
import { getServices } from "@/lib/site-content";
import { ArrowRight } from "lucide-react";
import { getTexts, pageTitle } from "@/lib/site-texts";

export async function generateMetadata(): Promise<Metadata> {
  return { title: await pageTitle("services.title") };
}

// "Bütün xidmətlər" siyahısı bazadan (admin panelində "Sayt" → Xidmətlər)
async function ServiceList() {
  const services = await getServices();
  return (
    <ul className="divide-y divide-night/10 overflow-hidden rounded-[28px] bg-white">
      {services.map((s) => {
        const Icon = serviceIcon(s.icon);
        return (
          <li key={s.id}>
            <Link href={`/xidmet/${s.slug}`}
              className="group grid items-center gap-4 px-7 py-7 transition-colors hover:bg-glacier/60 sm:grid-cols-[56px_1fr_1.4fr_24px] sm:gap-8">
              <span className="grid h-14 w-14 place-items-center rounded-2xl bg-glacier text-cold transition-colors group-hover:bg-cold group-hover:text-white"><Icon size={24} /></span>
              <h3 className="font-display text-xl font-bold">{s.title}</h3>
              <p className="text-night/65">{s.text}</p>
              <ArrowRight size={20} className="hidden text-cold transition-transform group-hover:translate-x-1 sm:block" />
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

export default async function ServicesPage() {
  const t = await getTexts();
  return (
    <>
      <PageIntro title={t["services.title"]} lead={t["services.lead"]} />
      {/* Obyekt növünə görə: hər biri ayrıca səhifə */}
      <section className="site-wrap">
        <h2 className="mb-6 font-display text-2xl font-bold sm:text-3xl">{t["services.segments"]}</h2>
        <Suspense fallback={<SegmentCardsSkeleton />}>
          <SegmentCards compact />
        </Suspense>
      </section>

      <section className="site-wrap mt-14">
        <h2 className="mb-6 font-display text-2xl font-bold sm:text-3xl">{t["services.list"]}</h2>
        <Suspense fallback={<div className="h-96 rounded-[28px] bg-white/60" />}>
          <ServiceList />
        </Suspense>
        <div className="mt-6 flex flex-wrap items-center justify-between gap-4 rounded-[28px] bg-night px-7 py-6 text-white">
          <p className="text-lg">{t["services.cta_text"]}</p>
          <Link href="/elaqe" className="inline-flex h-11 items-center rounded-full bg-cold px-5 font-bold transition-colors hover:bg-white hover:text-night">
            {t["services.cta_button"]}
          </Link>
        </div>
      </section>
    </>
  );
}
