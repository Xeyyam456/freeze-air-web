import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { PageIntro } from "@/components/landing/PageIntro";
import { Reveal } from "@/components/landing/Reveal";
import { SegmentVisual } from "@/components/landing/SegmentVisual";
import { Spotlight } from "@/components/landing/Spotlight";
import { serviceIcon } from "@/components/landing/icons";
import { getSegments, getServices } from "@/lib/site-content";
import { getTexts, pageTitle } from "@/lib/site-texts";

export async function generateMetadata(): Promise<Metadata> {
  return { title: await pageTitle("services.title") };
}

// Obyekt növləri: hündür şəkilli kartlar, ad və qısa izah şəklin üstündə (tünd keçid üzərində).
// Şəklin hansı hissəsinin görünəcəyini admin seçir (image_position).
async function SegmentTiles() {
  const segments = await getSegments();
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
      {segments.map((s, i) => (
        <Reveal key={s.id} delay={i * 90} className="h-full">
          <Spotlight className="h-full rounded-[28px]">
            <Link href={`/xidmetler/${s.slug}`} className="seg-tile group relative block aspect-[4/5] overflow-hidden rounded-[28px] bg-night">
              <SegmentVisual segment={s} className="transition-transform duration-700 group-hover:scale-110" />
              <span className="absolute inset-0 bg-gradient-to-t from-night via-night/40 to-transparent" aria-hidden="true" />
              <span className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 p-6 text-white">
                <span className="min-w-0">
                  <span className="block font-display text-xl font-bold">{s.title}</span>
                  {s.summary && <span className="mt-1.5 block text-sm text-white/70">{s.summary}</span>}
                </span>
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-white/15 ring-1 ring-white/25 backdrop-blur-md transition-all duration-300 group-hover:rotate-45 group-hover:bg-cold group-hover:ring-cold">
                  <ArrowUpRight size={20} />
                </span>
              </span>
            </Link>
          </Spotlight>
        </Reveal>
      ))}
    </div>
  );
}

// "Bütün xidmətlər": üç sütunlu kart şəbəkəsi. Kartda xidmətin şəkli (eyni 16:10 çərçivədə, simmetriya üçün), şəklin küncünə
// oturan ikon, ad, izah və "Ətraflı" həbi. Hover: kart qalxır, şəkil azca yaxınlaşır, kursor işığı (Spotlight).
// Əvvəlki variantlar bəyənilmədi: hover-də çıxan şəkil və iri sətirli siyahı.
async function ServiceList() {
  const [services, t] = await Promise.all([getServices(), getTexts()]);
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {services.map((s, i) => {
        const Icon = serviceIcon(s.icon);
        return (
          <Reveal key={s.id} delay={(i % 3) * 90} className="h-full">
            <Spotlight className="h-full rounded-[28px]">
              <Link href={`/xidmet/${s.slug}`}
                className="group flex h-full flex-col rounded-[28px] bg-white p-3 ring-1 ring-night/5 transition-[box-shadow,transform] duration-300 hover:-translate-y-1.5 hover:shadow-[0_28px_60px_rgba(6,25,43,0.14)]">
                <div className="relative">
                  {/* Bütün kartlarda eyni çərçivə (16:10): şəkillərin nisbəti fərqlidir, öz nisbətində göstərəndə kartlar qeyri-bərabər olurdu */}
                  <div className="aspect-[16/10] overflow-hidden rounded-[20px] bg-gradient-to-br from-ice to-glacier">
                    {s.image_url
                      // eslint-disable-next-line @next/next/no-img-element -- storage şəkli
                      ? <img src={s.image_url} alt="" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
                      : <div className="grid h-full place-items-center text-cold"><Icon size={56} strokeWidth={1.4} /></div>}
                  </div>
                  <span className="absolute -bottom-6 left-5 grid h-14 w-14 place-items-center rounded-2xl bg-cold text-white shadow-[0_12px_28px_rgba(0,163,217,0.4)] ring-4 ring-white transition-transform duration-300 group-hover:-rotate-6">
                    <Icon size={24} />
                  </span>
                </div>
                <div className="flex flex-1 flex-col px-4 pb-4 pt-10">
                  <h3 className="font-display text-xl font-bold leading-tight">{s.title}</h3>
                  {s.text && <p className="mt-2 text-night/60">{s.text}</p>}
                  <span className="mt-auto inline-flex w-fit items-center gap-2 pt-6 text-sm font-bold text-cold">
                    <span className="inline-flex items-center gap-2 rounded-full bg-glacier px-4 py-2 transition-colors group-hover:bg-cold group-hover:text-white">
                      {t["service.more"]} <ArrowRight size={15} className="transition-transform group-hover:translate-x-0.5" />
                    </span>
                  </span>
                </div>
              </Link>
            </Spotlight>
          </Reveal>
        );
      })}
    </div>
  );
}

export default async function ServicesPage() {
  const t = await getTexts();
  return (
    <>
      <PageIntro title={t["services.title"]} lead={t["services.lead"]} />

      {/* Obyekt növünə görə: hər biri ayrıca səhifə */}
      <section className="site-wrap">
        <Reveal>
          <h2 className="mb-8 font-display text-3xl font-bold sm:text-4xl">{t["services.segments"]}</h2>
        </Reveal>
        <Suspense fallback={<div className="grid gap-5 lg:grid-cols-4">{[0, 1, 2, 3].map((i) => <div key={i} className="aspect-[4/5] rounded-[28px] bg-white/60" />)}</div>}>
          <SegmentTiles />
        </Suspense>
      </section>

      <section className="site-wrap mt-20">
        <Reveal>
          <h2 className="mb-8 font-display text-3xl font-bold sm:text-4xl">{t["services.list"]}</h2>
        </Reveal>
        <Suspense fallback={<div className="h-96 rounded-[32px] bg-white/60" />}>
          <ServiceList />
        </Suspense>

        {/* Çağırış: tünd aurora kart, fırlanan işıqlı haşiyə */}
        <Reveal className="mt-6">
          <div className="glow-border aurora relative flex flex-wrap items-center justify-between gap-6 overflow-hidden rounded-[32px] bg-night px-10 py-10 text-white">
            <p className="max-w-2xl font-display text-2xl font-bold leading-snug">{t["services.cta_text"]}</p>
            <Link href="/elaqe" className="inline-flex h-12 items-center gap-2 rounded-full bg-cold px-7 font-bold transition-all hover:-translate-y-px hover:bg-white hover:text-night">
              {t["services.cta_button"]} <ArrowRight size={18} />
            </Link>
          </div>
        </Reveal>
      </section>
    </>
  );
}
