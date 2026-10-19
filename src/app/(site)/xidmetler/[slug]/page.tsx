import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ArrowRight, ArrowUpRight, CircleAlert, CircleCheck, Lightbulb } from "lucide-react";
import { EquipmentVisual } from "@/components/landing/EquipmentVisual";
import { PageIntro } from "@/components/landing/PageIntro";
import { Reveal } from "@/components/landing/Reveal";
import { SegmentVisual } from "@/components/landing/SegmentVisual";
import { Spotlight } from "@/components/landing/Spotlight";
import { getEquipment, getSegments, segmentEquipment } from "@/lib/site-content";
import { getTexts } from "@/lib/site-texts";

// Obyekt növünə görə ayrıca xidmət səhifəsi (məzmun bazadan, admin panelində "Sayt" → Obyektlər)
export async function generateStaticParams() {
  const segments = await getSegments();
  return segments.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: PageProps<"/xidmetler/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const [segments, t] = await Promise.all([getSegments(), getTexts()]);
  const s = segments.find((x) => x.slug === slug);
  return { title: s ? `${s.title} — ${t["brand.name"]}` : t["brand.name"] };
}

// params Suspense daxilində oxunur (Next 16: səhifənin qalanı dərhal göstərilsin)
export default function SegmentPage({ params }: PageProps<"/xidmetler/[slug]">) {
  return (
    <Suspense fallback={<div className="site-wrap py-20 text-night/50">Yüklənir...</div>}>
      {params.then(({ slug }) => <SegmentContent slug={slug} />)}
    </Suspense>
  );
}

async function SegmentContent({ slug }: { slug: string }) {
  const [segments, allEquipment, t] = await Promise.all([getSegments(), getEquipment(), getTexts()]);
  const segment = segments.find((s) => s.slug === slug);
  if (!segment) notFound();

  const equipment = segmentEquipment(segment, allEquipment);
  const others = segments.filter((s) => s.id !== segment.id);

  return (
    <>
      <PageIntro title={segment.title} lead={segment.lead} parent={{ href: "/xidmetler", label: t["nav.services"] }} />

      {/* Solda şəkil öz nisbətində (kəsilmir), sağda qısa məlumat və çağırış */}
      {segment.image_url && (
        <section className="site-wrap mb-14 grid items-stretch gap-4 lg:grid-cols-[1.5fr_1fr]">
          <Reveal className="reveal-wipe">
            <div className="overflow-hidden rounded-[32px] bg-white">
              {/* eslint-disable-next-line @next/next/no-img-element -- storage şəkli */}
              <img src={segment.image_url} alt={segment.title} className="block h-auto w-full" />
            </div>
          </Reveal>
          <div className="glow-border aurora relative flex flex-col overflow-hidden rounded-[32px] bg-night p-8 text-white">
            <p className="font-semibold text-cold">{segment.title}</p>
            {segment.summary && <h2 className="mt-2 font-display text-2xl font-bold leading-tight">{segment.summary}</h2>}
            {segment.work.length > 0 && (
              <ul className="mb-8 mt-6 space-y-3">
                {segment.work.slice(0, 3).map((w) => (
                  <li key={w} className="flex items-start gap-3 text-white/80">
                    <CircleCheck size={20} className="mt-0.5 shrink-0 text-cold" /> <span>{w}</span>
                  </li>
                ))}
              </ul>
            )}
            {equipment.length > 0 && (
              <div className="mt-6 flex flex-wrap gap-2">
                {equipment.map((e) => (
                  <span key={e.id} className="rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold text-white/80 ring-1 ring-white/15">{e.title}</span>
                ))}
              </div>
            )}
            <Link href="/elaqe" className="mt-auto inline-flex h-12 w-fit items-center gap-2 rounded-full bg-cold px-6 font-bold text-white transition-colors hover:bg-white hover:text-night">
              {t["segment.cta"]} <ArrowRight size={18} />
            </Link>
          </div>
        </section>
      )}

      {/* Tipik avadanlıq */}
      {equipment.length > 0 && (
        <section className="site-wrap">
          <h2 className="font-display text-2xl font-bold sm:text-3xl">{t["segment.equipment"]}</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {equipment.map((e, i) => {
              return (
                <Reveal key={e.id} delay={i * 90} className="h-full">
                  <Spotlight className="h-full rounded-[28px]">
                    <div className="group h-full overflow-hidden rounded-[28px] bg-white transition-[box-shadow,transform] duration-300 hover:-translate-y-1 hover:shadow-[0_24px_50px_rgba(6,25,43,0.12)]">
                      <div className="aspect-video overflow-hidden"><EquipmentVisual item={e} className="transition-transform duration-700 group-hover:scale-105" /></div>
                      <div className="p-6">
                        <h3 className="font-display text-lg font-bold">{e.title}</h3>
                        <p className="mt-2 text-sm text-night/60">{e.text}</p>
                      </div>
                    </div>
                  </Spotlight>
                </Reveal>
              );
            })}
          </div>
        </section>
      )}

      {/* Problemlər və görülən işlər */}
      {(segment.issues.length > 0 || segment.work.length > 0) && (
        <section className="site-wrap mt-14 grid gap-4 lg:grid-cols-2">
          {segment.issues.length > 0 && (
            <div className="rounded-[28px] bg-white p-8">
              <h2 className="font-display text-2xl font-bold">{t["segment.issues"]}</h2>
              <ul className="mt-6 space-y-4">
                {segment.issues.map((i) => (
                  <li key={i} className="flex items-start gap-3">
                    <CircleAlert size={20} className="mt-0.5 shrink-0 text-heat" /> <span>{i}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {segment.work.length > 0 && (
            <div className="aurora relative overflow-hidden rounded-[28px] bg-night p-8 text-white">
              <h2 className="font-display text-2xl font-bold">{t["segment.work"]}</h2>
              <ul className="mt-6 space-y-4">
                {segment.work.map((w) => (
                  <li key={w} className="flex items-start gap-3">
                    <CircleCheck size={20} className="mt-0.5 shrink-0 text-cold" /> <span className="text-white/85">{w}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>
      )}

      {/* Qeyd və çağırış */}
      <section className="site-wrap mt-4">
        <div className="flex flex-wrap items-center justify-between gap-6 rounded-[28px] bg-gradient-to-r from-cold to-[#0086c3] p-8 text-white shadow-[0_20px_50px_rgba(0,163,217,0.25)]">
          {segment.note
            ? <p className="flex max-w-3xl items-start gap-3 text-lg"><Lightbulb size={24} className="mt-0.5 shrink-0" /> {segment.note}</p>
            : <p className="text-lg">{t["segment.note_fallback"]}</p>}
          <Link href="/elaqe" className="inline-flex h-12 items-center gap-2 rounded-full bg-white px-6 font-bold text-night transition-all hover:-translate-y-px hover:bg-night hover:text-white">
            {t["segment.cta"]} <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      {/* Digər obyekt növləri */}
      {others.length > 0 && (
        <section className="site-wrap mt-14">
          <h2 className="font-display text-2xl font-bold">{t["segment.others"]}</h2>
          {/* Xidmətlər səhifəsindəki kimi şəkilli kartlar, ad və izah şəklin üstündə */}
          <div className="mt-6 grid gap-5 md:grid-cols-3">
            {others.map((o) => (
              <Spotlight key={o.id} className="rounded-[28px]">
                <Link href={`/xidmetler/${o.slug}`} className="group relative block aspect-[16/10] overflow-hidden rounded-[28px] bg-night">
                  <SegmentVisual segment={o} className="transition-transform duration-700 group-hover:scale-110" />
                  <span className="absolute inset-0 bg-gradient-to-t from-night via-night/40 to-transparent" aria-hidden="true" />
                  <span className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 p-6 text-white">
                    <span className="min-w-0">
                      <span className="block font-display text-lg font-bold">{o.title}</span>
                      {o.summary && <span className="mt-1 block text-sm text-white/70">{o.summary}</span>}
                    </span>
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-white/15 ring-1 ring-white/25 backdrop-blur-md transition-all duration-300 group-hover:rotate-45 group-hover:bg-cold group-hover:ring-cold">
                      <ArrowUpRight size={18} />
                    </span>
                  </span>
                </Link>
              </Spotlight>
            ))}
          </div>
        </section>
      )}
    </>
  );
}
