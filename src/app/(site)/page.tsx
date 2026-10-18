import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CircleCheck, ClipboardCheck, Clock, MapPin, Phone, Snowflake, Sun } from "lucide-react";
import { OutdoorUnit, SplitUnit } from "@/components/landing/AcIllustrations";
import { HeroQuickForm } from "@/components/landing/HeroQuickForm";
import { LocalBusinessJsonLd } from "@/components/landing/LocalBusinessJsonLd";
import { Reveal } from "@/components/landing/Reveal";
import { SegmentCards, SegmentCardsSkeleton } from "@/components/landing/SegmentCards";
import { FaqSection, HowSteps, StatsStrip } from "@/components/landing/TrustSections";
import { Suspense } from "react";
import { CATEGORIES } from "@/components/landing/content";
import { getContact, getHomeContent, telHref } from "@/lib/site-settings";
import { getTexts, lines, type Texts } from "@/lib/site-texts";

export async function generateMetadata(): Promise<Metadata> {
  return { title: (await getTexts())["brand.name"] };
}

// Bölmə başlığı: kiçik göy xətt + böyük başlıq (mərkəzdə)
function SectionTitle({ title, lead, light = false }: { title: string; lead?: string; light?: boolean }) {
  return (
    <div className="mx-auto max-w-2xl text-center">
      <span className={`mx-auto block h-1 w-12 rounded-full ${light ? "bg-white" : "bg-cold"}`} aria-hidden="true" />
      <h2 className={`mt-4 font-display text-3xl font-bold sm:text-4xl ${light ? "text-white" : ""}`}>{title}</h2>
      {lead && <p className={`mt-3 ${light ? "text-white/75" : "text-night/60"}`}>{lead}</p>}
    </div>
  );
}

function HeroIllustration() {
  return (
    <div className="rounded-[32px] bg-gradient-to-br from-white to-ice p-10 shadow-[0_30px_80px_rgba(0,0,0,0.3)]">
      <SplitUnit className="w-full" />
      <div className="mx-auto mt-2 flex w-[80%] flex-col gap-3" aria-hidden="true">
        {[0, 1, 2].map((i) => (
          <span key={i} className="airflow block h-[3px] rounded-full bg-gradient-to-r from-transparent via-cold to-transparent"
            style={{ animationDelay: `${i * 0.6}s`, width: `${100 - i * 18}%`, marginLeft: `${i * 9}%` }} />
        ))}
      </div>
    </div>
  );
}

// Hero şəkli bazadan; şəkil öz nisbətində göstərilir (kəsilmir)
async function HeroVisual({ alt }: { alt: string }) {
  const { heroImage: url } = await getHomeContent();
  if (!url) return <HeroIllustration />;
  return (
    // eslint-disable-next-line @next/next/no-img-element -- storage şəkli
    <img src={url} alt={alt} className="block h-auto w-full rounded-[32px] shadow-[0_30px_80px_rgba(0,0,0,0.3)]" />
  );
}

// "Haqqımızda" kartının rəngi (admin panelində seçilir): fon, ikon, alt yazı
const CARD_COLORS = {
  night: { box: "bg-night text-white", icon: "text-cold", sub: "text-white/60" },
  cold: { box: "bg-cold text-white", icon: "text-white", sub: "text-white/75" },
  ice: { box: "bg-ice text-night", icon: "text-cold", sub: "text-night/60" },
  white: { box: "bg-white text-night", icon: "text-cold", sub: "text-night/60" },
};

// "Haqqımızda": mətn və şəkillər bazadan; şəkil yoxdursa illüstrasiya, şəkil kəsilmir
async function About({ t }: { t: Texts }) {
  const a = (await getHomeContent()).about;
  const color = CARD_COLORS[a.cardColor];
  return (
    <>
      <div className="grid grid-cols-2 gap-4">
        {a.mainImage
          // eslint-disable-next-line @next/next/no-img-element -- storage şəkli
          ? <img src={a.mainImage} alt="" className="col-span-2 block h-auto w-full rounded-[28px]" />
          : <div className="col-span-2 grid place-items-center rounded-[28px] bg-white p-8"><OutdoorUnit className="w-full max-w-[320px]" /></div>}
        {a.sideImage
          // eslint-disable-next-line @next/next/no-img-element -- storage şəkli
          ? <img src={a.sideImage} alt="" className="block h-auto w-full self-center rounded-[28px]" />
          : <div className="grid place-items-center rounded-[28px] bg-ice p-6"><SplitUnit className="w-full" /></div>}
        <div className={`flex flex-col justify-center rounded-[28px] p-6 ${color.box}`}>
          <ClipboardCheck size={30} className={color.icon} />
          <p className="mt-3 font-display text-lg font-bold">{a.cardTitle}</p>
          {a.cardText && <p className={`mt-1 text-sm ${color.sub}`}>{a.cardText}</p>}
        </div>
      </div>
      <div>
        <p className="font-semibold text-cold">{t["home.about.label"]}</p>
        <h2 className="mt-2 font-display text-3xl font-bold leading-tight sm:text-4xl">{a.title}</h2>
        {a.text.map((t) => <p key={t} className="mt-4 text-night/65">{t}</p>)}
        {a.points.length > 0 && (
          <ul className="mt-6 space-y-3">
            {a.points.map((p) => (
              <li key={p} className="flex items-center gap-3 font-semibold"><CircleCheck size={20} className="text-cold" /> {p}</li>
            ))}
          </ul>
        )}
        <Link href="/nece-isleyirik" className="mt-8 inline-flex h-12 items-center gap-2 rounded-full bg-cold px-6 font-bold text-white transition-colors hover:bg-night">
          {t["home.about.button"]} <ArrowRight size={18} />
        </Link>
      </div>
    </>
  );
}

// Sürətli əlaqə bloku: məlumatlar bazadan (admin panelində "Sayt")
async function QuickContact({ t }: { t: Texts }) {
  const c = await getContact();
  const items = [
    { icon: Phone, label: t["home.contact.phone"], value: c.phone, href: telHref(c.phone) },
    { icon: MapPin, label: t["home.contact.address"], value: c.address },
    { icon: Clock, label: t["home.contact.hours"], value: c.hours },
  ];
  const mapUrl = `https://www.google.com/maps?q=${encodeURIComponent(c.address)}&z=13&output=embed&hl=az`;

  return (
    <>
      <div className="rounded-[28px] bg-night p-8 text-white sm:p-10">
        <p className="font-semibold text-cold">{t["home.contact.label"]}</p>
        <h2 className="mt-2 font-display text-3xl font-bold">{t["home.contact.title"]}</h2>
        <p className="mt-3 text-white/60">{t["home.contact.text"]}</p>
        <ul className="mt-8 space-y-5">
          {items.map(({ icon: Icon, label, value, href }) => (
            <li key={label} className="flex items-center gap-4">
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-white/10 text-cold"><Icon size={20} /></span>
              <span>
                <span className="block text-xs text-white/50">{label}</span>
                {href ? <a href={href} className="font-semibold hover:text-cold">{value}</a> : <span className="font-semibold">{value}</span>}
              </span>
            </li>
          ))}
        </ul>
        <Link href="/elaqe" className="mt-8 inline-flex h-12 items-center gap-2 rounded-full bg-cold px-6 font-bold transition-colors hover:bg-white hover:text-night">
          {t["home.contact.button"]} <ArrowRight size={18} />
        </Link>
      </div>
      <div className="overflow-hidden rounded-[28px] bg-white">
        <iframe src={mapUrl} title={`Xəritə: ${c.address}`} className="h-full min-h-[360px] w-full" loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
      </div>
    </>
  );
}

// Hero-dakı form altındakı yazı: qısa izah + telefon (bazadan)
async function HeroNote({ t }: { t: Texts }) {
  const c = await getContact();
  const tel = telHref(c.phone);
  return (
    <p className="mt-4 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-white/65">
      <span>{t["home.quick.note"]}</span>
      {tel && (
        <>
          <span className="text-white/30" aria-hidden="true">·</span>
          <span>{t["home.quick.or"]}:</span>
          <a href={tel} className="inline-flex items-center gap-1.5 font-bold text-white transition-colors hover:text-heat"><Phone size={14} /> {c.phone}</a>
        </>
      )}
    </p>
  );
}

// Sürətli müraciət formu: admin "Sayt → Ana səhifə"dən göstərib-gizlədir, mətnləri dəyişir
async function HeroForm({ t }: { t: Texts }) {
  if (!(await getHomeContent()).heroFormEnabled) return null;
  return (
    <>
      <HeroQuickForm t={t} />
      <HeroNote t={t} />
    </>
  );
}

export default async function HomePage() {
  const t = await getTexts();
  return (
    <>
      <Suspense fallback={null}>
        <LocalBusinessJsonLd />
      </Suspense>
      {/* Hero banner */}
      <section className="relative overflow-hidden bg-gradient-to-br from-night via-[#0b3a5c] to-cold pb-8 text-white lg:pb-14">
        <div className="pointer-events-none absolute inset-0 bg-[repeating-linear-gradient(90deg,rgba(255,255,255,0.04)_0_1px,transparent_1px_32px)]" aria-hidden="true" />
        <div className="site-wrap relative grid items-center gap-14 py-16 lg:grid-cols-[1.05fr_1fr] lg:py-24">
          <div>
            <div className="hero-in flex flex-wrap gap-2 text-sm font-semibold">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-heat/20 px-3 py-1.5 text-[#ffd08a]"><Sun size={15} /> {t["home.hero.badge_out"]}</span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1.5 text-ice"><Snowflake size={15} /> {t["home.hero.badge_in"]}</span>
            </div>
            <h1 className="hero-in mt-6 font-display text-4xl font-bold leading-[1.05] sm:text-5xl lg:text-6xl" style={{ "--d": "80ms" } as React.CSSProperties}>
              {t["home.hero.title"]}
            </h1>
            <p className="hero-in mt-5 max-w-xl text-lg text-white/75" style={{ "--d": "160ms" } as React.CSSProperties}>
              {t["home.hero.lead"]}
            </p>
            <div className="hero-in" style={{ "--d": "240ms" } as React.CSSProperties}>
              <Suspense fallback={<div className="mt-9 h-[68px] max-w-xl rounded-[28px] bg-white/10" aria-hidden="true" />}>
                <HeroForm t={t} />
              </Suspense>
              <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm font-bold">
                <Link href="/elaqe" className="inline-flex items-center gap-1.5 text-white/85 underline-offset-4 transition-colors hover:text-white hover:underline">
                  {t["home.hero.cta"]} <ArrowRight size={15} />
                </Link>
                <Link href="/xidmetler" className="inline-flex items-center gap-1.5 text-white/85 underline-offset-4 transition-colors hover:text-white hover:underline">
                  {t["home.hero.cta2"]} <ArrowRight size={15} />
                </Link>
              </div>
            </div>
          </div>

          {/* Şəkil yeri: admin yükləyibsə foto, yoxdursa kondisioner illüstrasiyası; üzən kartlar hər ikisində */}
          <div className="hero-in relative mx-2 sm:mx-8" style={{ "--d": "200ms" } as React.CSSProperties}>
            {/* Yüklənərkən illüstrasiya yox, neytral boş yer: yoxsa başqa səhifədən qayıdanda əvvəl SVG, sonra real şəkil görünürdü */}
            <Suspense fallback={<div className="aspect-[16/9] w-full rounded-[32px] bg-white/10" aria-hidden="true" />}>
              <HeroVisual alt={t["home.hero.title"]} />
            </Suspense>
            <div className="absolute -bottom-6 -left-6 rounded-2xl bg-white px-5 py-4 text-night shadow-[0_16px_40px_rgba(6,25,43,0.25)]">
              <p className="text-xs font-semibold text-night/50">{t["home.hero.temp_label"]}</p>
              <p className="font-display text-3xl font-bold text-cold">{t["home.hero.temp"]}</p>
            </div>
            <div className="absolute -right-6 -top-5 flex items-center gap-2 rounded-2xl bg-night px-4 py-3 text-sm font-semibold shadow-[0_16px_40px_rgba(0,0,0,0.3)]">
              <CircleCheck size={18} className="text-cold" /> {t["home.hero.badge"]}
            </div>
          </div>
        </div>
      </section>

      {/* İnam: rəqəmlər zolağı (hero-nun üstünə çıxır); ən azı 2 aktiv rəqəm yoxdursa göstərilmir */}
      <Suspense fallback={null}>
        <StatsStrip />
      </Suspense>

      {/* Haqqımızda */}
      <section className="site-wrap grid items-center gap-12 py-20 lg:grid-cols-2">
        <Suspense fallback={<div className="min-h-[420px] rounded-[28px] bg-white/60 lg:col-span-2" />}>
          <About t={t} />
        </Suspense>
      </section>

      {/* Xidmət: obyekt növlərinə görə */}
      <section className="bg-white py-20">
        <div className="site-wrap">
          <Reveal>
            <SectionTitle title={t["home.segments.title"]} lead={t["home.segments.lead"]} />
          </Reveal>
          <div className="mt-12">
            <Suspense fallback={<SegmentCardsSkeleton />}>
              <SegmentCards />
            </Suspense>
          </div>
        </div>
      </section>

      {/* Necə işləyirik: 3 addım */}
      <HowSteps t={t} />

      {/* Xidmət kateqoriyaları: göy zolaq */}
      <section className="relative overflow-hidden bg-cold py-20 text-white">
        <Snowflake size={420} strokeWidth={0.5} className="pointer-events-none absolute -left-24 -top-24 text-white/10" aria-hidden="true" />
        <div className="site-wrap relative">
          <Reveal>
            <SectionTitle title={t["home.categories.title"]} lead={t["home.categories.lead"]} light />
          </Reveal>
          <div className="mt-12 grid gap-5 lg:grid-cols-3">
            {CATEGORIES.map(({ icon: Icon, title, items }, i) => (
              <Reveal key={title} delay={i * 100} className="h-full">
                <div className="h-full rounded-[28px] bg-white p-7 text-night shadow-[0_20px_50px_rgba(6,25,43,0.15)]">
                  <div className="flex items-center gap-4">
                    <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-glacier text-cold"><Icon size={26} /></span>
                    <h3 className="font-display text-lg font-bold leading-tight">{t[title]}</h3>
                  </div>
                  <ul className="mt-6 divide-y divide-night/10">
                    {lines(t[items]).map((item) => (
                      <li key={item} className="flex items-center gap-3 py-3 font-medium">
                        <CircleCheck size={18} className="shrink-0 text-cold" /> {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Tez-tez verilən suallar (boşdursa göstərilmir) */}
      <Suspense fallback={null}>
        <FaqSection t={t} />
      </Suspense>

      {/* Sürətli əlaqə və xəritə */}
      <section className="site-wrap grid gap-6 pb-2 lg:grid-cols-[1fr_1.4fr]">
        <Suspense fallback={<div className="min-h-[420px] rounded-[28px] bg-night lg:col-span-2" />}>
          <QuickContact t={t} />
        </Suspense>
      </section>
    </>
  );
}
