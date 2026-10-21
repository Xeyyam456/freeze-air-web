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

      {/* Solda şəkil öz nisbətində (kəsilmir), sağda qısa məlumat və çağırış.
          Məlumat kartı şəkildən hündür olanda (1024–1279) şəkil xananı doldurur (yanlardan azca kəsilir), altında boşluq qalmır */}
      {segment.image_url && (
        <section className="site-wrap mb-14 grid items-stretch gap-4 lg:grid-cols-[1.5fr_1fr]">
          <Reveal className="reveal-wipe">
            <div className="overflow-hidden rounded-[32px] bg-white lg:h-full">
              {/* eslint-disable-next-line @next/next/no-img-element -- storage şəkli */}
              <img src={segment.image_url} alt={segment.title} className="block h-auto w-full lg:h-full lg:object-cover" />
            </div>
          </Reveal>
          {/* ≥ 1024: şəklin yanında sütun (həblər + düymə aşağıda). < 1024 hər şey alt-alta, düymə tam endə.
              Planşetdə iki sütun sınandı (sağda həblər + düymə aşağıda) — üstündə boş yer qalırdı, bəyənilmədi. */}
          <div className="glow-border aurora relative flex flex-col overflow-hidden rounded-[32px] bg-night p-8 text-white max-sm:p-6">
            <div>
              <p className="font-semibold text-cold">{segment.title}</p>
              {segment.summary && <h2 className="mt-2 text-balance font-display text-2xl font-bold leading-tight max-sm:text-xl">{segment.summary}</h2>}
            </div>
            {segment.work.length > 0 && (
              <ul className="mt-6 space-y-3 max-sm:mt-5">
                {segment.work.slice(0, 3).map((w) => (
                  <li key={w} className="flex items-start gap-3 text-white/80">
                    <CircleCheck size={20} className="mt-0.5 shrink-0 text-cold" /> <span>{w}</span>
                  </li>
                ))}
              </ul>
            )}
            {/* Həblər + düymə bir qrup: həmişə kartın altında, araları hər ölçüdə 16px (əvvəl ölçüyə görə ya yapışırdı, ya aralanırdı) */}
            <div className="flex flex-col pt-6 max-sm:pt-0 lg:mt-auto">
              {equipment.length > 0 && (
                // Həblər "Tipik avadanlıq"ın təkrarıdır: dar kartda (mobil, 1024–1279) iki sətrə bölünürdü → orada gizli
                <div className="flex flex-wrap gap-2 max-sm:hidden lg:max-xl:hidden">
                  {equipment.map((e) => (
                    <span key={e.id} className="rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold text-white/80 ring-1 ring-white/15">{e.title}</span>
                  ))}
                </div>
              )}
              <Link href="/elaqe" className="mt-4 inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-cold px-6 font-bold text-white transition-colors hover:bg-white hover:text-night max-sm:mt-6">
                {t["segment.cta"]} <ArrowRight size={18} />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Tipik avadanlıq */}
      {equipment.length > 0 && (
        <section className="site-wrap">
          <h2 className="font-display text-2xl font-bold max-sm:text-center sm:text-3xl">{t["segment.equipment"]}</h2>
          {/* ≥ 1024 üç sütun; planşetdə üç sütun çox dar idi (ad 2 sətir) → üfüqi kartlar: solda şəkil, sağda mətn */}
          <div className="mt-6 grid gap-4 lg:grid-cols-3">
            {equipment.map((e, i) => {
              return (
                <Reveal key={e.id} delay={i * 90} className="h-full">
                  <Spotlight className="h-full rounded-[28px]">
                    <div className="group h-full overflow-hidden rounded-[28px] bg-white transition-[box-shadow,transform] duration-300 hover:-translate-y-1 hover:shadow-[0_24px_50px_rgba(6,25,43,0.12)] sm:max-lg:flex">
                      <div className="aspect-video overflow-hidden sm:max-lg:aspect-auto sm:max-lg:min-h-40 sm:max-lg:w-2/5 sm:max-lg:shrink-0"><EquipmentVisual item={e} className="transition-transform duration-700 group-hover:scale-105" /></div>
                      <div className="p-6 sm:max-lg:self-center">
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
        <section className="site-wrap mt-14 grid gap-4 md:grid-cols-2">
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
        {/* ≥ 640 düymə həmişə sağda, mətnlə bir sırada */}
        <div className="flex flex-wrap items-center justify-between gap-6 rounded-[28px] bg-gradient-to-r from-cold to-[#0086c3] p-8 text-white shadow-[0_20px_50px_rgba(0,163,217,0.25)] sm:flex-nowrap">
          {segment.note
            ? <p className="flex min-w-0 max-w-3xl items-start gap-3 text-lg"><Lightbulb size={24} className="mt-0.5 shrink-0" /> {segment.note}</p>
            : <p className="min-w-0 text-lg">{t["segment.note_fallback"]}</p>}
          <Link href="/elaqe" className="inline-flex h-12 shrink-0 items-center justify-center gap-2 rounded-full bg-white px-6 font-bold text-night transition-all hover:-translate-y-px hover:bg-night hover:text-white max-sm:w-full">
            {t["segment.cta"]} <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      {/* Digər obyekt növləri */}
      {others.length > 0 && (
        <section className="site-wrap mt-14">
          <h2 className="font-display text-2xl font-bold max-sm:text-center">{t["segment.others"]}</h2>
          {/* Xidmətlər səhifəsindəki kimi şəkilli kartlar, ad və izah şəklin üstündə */}
          {/* ≥ 1024 üç sütun; planşetdə və mobildə alt-alta enli kartlar (üç sütunda ad 13px-ə düşürdü) */}
          <div className="mt-6 grid gap-5 lg:grid-cols-3">
            {others.map((o) => (
              <Spotlight key={o.id} className="rounded-[28px]">
                <Link href={`/xidmetler/${o.slug}`} className="group relative block aspect-[16/10] overflow-hidden rounded-[28px] bg-night sm:max-lg:aspect-[3/1]">
                  <SegmentVisual segment={o} className="transition-transform duration-700 group-hover:scale-110" />
                  <span className="absolute inset-0 bg-gradient-to-t from-night via-night/40 to-transparent" aria-hidden="true" />
                  {/* Ad bir sətirdə (şrift kartın eninə görə), izah həmişə 2 sətir yer tutur: başlıqlar bir xətdə qalır.
                      Ox düyməsi yuxarı sağ küncdə, mətn bütün eni tutur */}
                  <span className="@container absolute inset-x-0 bottom-0 p-6 text-white">
                    <span className="block font-display text-[min(1.125rem,calc(100cqi/13.2))] font-bold">{o.title}</span>
                    {o.summary && <span className="mt-1 line-clamp-2 min-h-[2lh] text-sm text-white/70">{o.summary}</span>}
                  </span>
                  <span className="absolute right-5 top-5 grid h-10 w-10 place-items-center rounded-full bg-white/15 text-white ring-1 ring-white/25 backdrop-blur-md transition-all duration-300 group-hover:rotate-45 group-hover:bg-cold group-hover:ring-cold">
                    <ArrowUpRight size={18} />
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
