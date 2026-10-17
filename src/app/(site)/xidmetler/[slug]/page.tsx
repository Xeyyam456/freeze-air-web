import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ArrowRight, CircleAlert, CircleCheck, Lightbulb } from "lucide-react";
import { EquipmentVisual } from "@/components/landing/EquipmentVisual";
import { PageIntro } from "@/components/landing/PageIntro";
import { SegmentVisual } from "@/components/landing/SegmentVisual";
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
          <div className="overflow-hidden rounded-[32px] bg-white">
            {/* eslint-disable-next-line @next/next/no-img-element -- storage şəkli */}
            <img src={segment.image_url} alt={segment.title} className="block h-auto w-full" />
          </div>
          <div className="flex flex-col rounded-[32px] bg-white p-8">
            <p className="font-semibold text-cold">{segment.title}</p>
            {segment.summary && <h2 className="mt-2 font-display text-2xl font-bold leading-tight">{segment.summary}</h2>}
            {segment.work.length > 0 && (
              <ul className="mt-6 space-y-3">
                {segment.work.slice(0, 3).map((w) => (
                  <li key={w} className="flex items-start gap-3 text-night/75">
                    <CircleCheck size={20} className="mt-0.5 shrink-0 text-cold" /> <span>{w}</span>
                  </li>
                ))}
              </ul>
            )}
            {equipment.length > 0 && (
              <div className="mt-6 flex flex-wrap gap-2">
                {equipment.map((e) => (
                  <span key={e.id} className="rounded-full bg-glacier px-3 py-1.5 text-xs font-semibold text-night/70">{e.title}</span>
                ))}
              </div>
            )}
            <Link href="/elaqe" className="mt-8 inline-flex h-12 w-fit items-center gap-2 rounded-full bg-cold px-6 font-bold text-white transition-colors hover:bg-night">
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
            {equipment.map((e) => {
              return (
                <div key={e.id} className="overflow-hidden rounded-[28px] bg-white">
                  <div className="aspect-video"><EquipmentVisual item={e} /></div>
                  <div className="p-6">
                    <h3 className="font-display text-lg font-bold">{e.title}</h3>
                    <p className="mt-2 text-sm text-night/60">{e.text}</p>
                  </div>
                </div>
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
            <div className="rounded-[28px] bg-night p-8 text-white">
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
        <div className="flex flex-wrap items-center justify-between gap-6 rounded-[28px] bg-cold p-8 text-white">
          {segment.note
            ? <p className="flex max-w-3xl items-start gap-3 text-lg"><Lightbulb size={24} className="mt-0.5 shrink-0" /> {segment.note}</p>
            : <p className="text-lg">{t["segment.note_fallback"]}</p>}
          <Link href="/elaqe" className="inline-flex h-12 items-center gap-2 rounded-full bg-white px-6 font-bold text-night transition-colors hover:bg-night hover:text-white">
            {t["segment.cta"]} <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      {/* Digər obyekt növləri */}
      {others.length > 0 && (
        <section className="site-wrap mt-14">
          <h2 className="font-display text-2xl font-bold">{t["segment.others"]}</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {others.map((o) => (
              <Link key={o.id} href={`/xidmetler/${o.slug}`}
                className="group flex items-center gap-5 rounded-[24px] bg-white p-5 transition-shadow hover:shadow-[0_16px_40px_rgba(6,25,43,0.1)]">
                <span className="h-20 w-24 shrink-0 overflow-hidden rounded-2xl">
                  <SegmentVisual segment={o} className="!p-2" artClassName="w-full" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-display font-bold">{o.title}</span>
                  {o.summary && <span className="mt-1 block text-sm text-night/60">{o.summary}</span>}
                </span>
                <ArrowRight size={18} className="shrink-0 text-cold transition-transform group-hover:translate-x-1" />
              </Link>
            ))}
          </div>
        </section>
      )}
    </>
  );
}
