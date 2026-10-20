import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CircleCheck, ClipboardCheck, Clock, MapPin, Phone, Snowflake, Sun } from "lucide-react";
import { OutdoorUnit, SplitUnit } from "@/components/landing/AcIllustrations";
import { AirflowCanvas } from "@/components/landing/AirflowCanvas";
import { HeroQuickForm } from "@/components/landing/HeroQuickForm";
import { HeroTitle } from "@/components/landing/HeroTitle";
import { LocalBusinessJsonLd } from "@/components/landing/LocalBusinessJsonLd";
import { Reveal } from "@/components/landing/Reveal";
import { SegmentCards, SegmentCardsSkeleton } from "@/components/landing/SegmentCards";
import { Spotlight } from "@/components/landing/Spotlight";
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
      <h2 className={`mt-4 text-balance font-display text-[clamp(1.4rem,6.9vw,1.875rem)] font-bold sm:text-4xl ${light ? "text-white" : ""}`}>{title}</h2>
      {lead && <p className={`mt-3 ${light ? "text-white/75" : "text-night/60"}`}>{lead}</p>}
    </div>
  );
}

// Hero arka planı: şəkil bazadan (admin → Sayt → Ana səhifə); yoxdursa bölmənin gradient fonu qalır.
// Soldan sağa tünd overlay mətnin oxunmasını təmin edir, şəklin sağ tərəfi açıq qalır.
async function HeroBackground() {
  const { heroImage: url } = await getHomeContent();
  if (!url) return null;
  return (
    <>
      {/* eslint-disable-next-line @next/next/no-img-element -- storage şəkli */}
      <img src={url} alt="" className="hero-parallax col-start-1 row-start-1 block h-[calc(100svh-77px)] min-h-[560px] w-full object-cover object-top max-xl:object-right-top max-sm:object-[86%_top]" />
      {/* relative: şəkil parallax üçün transform alır və qat yaradır; overlay onun üstündə qalsın deyə o da mövqeli olmalıdır */}
      <div className="relative col-start-1 row-start-1 bg-gradient-to-r from-night/90 via-night/65 to-night/10" aria-hidden="true" />
      <AirflowCanvas />
    </>
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
      {/* Şəkillər pərdə kimi soldan açılır (.reveal-wipe), rəngli kart yavaşca "nəfəs alır" (.float-soft) */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        <Reveal className="reveal-wipe col-span-2">
          {a.mainImage
            // eslint-disable-next-line @next/next/no-img-element -- storage şəkli
            ? <img src={a.mainImage} alt="" className="block h-auto w-full rounded-[28px]" />
            : <div className="grid place-items-center rounded-[28px] bg-white p-8"><OutdoorUnit className="w-full max-w-[320px]" /></div>}
        </Reveal>
        <Reveal className="reveal-wipe self-center" delay={180}>
          {a.sideImage
            // eslint-disable-next-line @next/next/no-img-element -- storage şəkli
            ? <img src={a.sideImage} alt="" className="block h-auto w-full rounded-[28px]" />
            : <div className="grid place-items-center rounded-[28px] bg-ice p-6"><SplitUnit className="w-full" /></div>}
        </Reveal>
        {/* Mobildə kart yarım endədir: kənar boşluq və başlıq kiçilir */}
        <div className={`float-soft flex flex-col justify-center rounded-[28px] p-4 sm:p-6 ${color.box}`}>
          <ClipboardCheck size={30} className={color.icon} />
          <p className="mt-3 font-display text-base font-bold sm:text-lg">{a.cardTitle}</p>
          {a.cardText && <p className={`mt-1 text-sm ${color.sub}`}>{a.cardText}</p>}
        </div>
      </div>
      <div>
        <p className="font-semibold text-cold">{t["home.about.label"]}</p>
        {/* Planşetdə mətn tam endədir: şrift enə görə kiçilir ki, başlıq bir sətrə sığsın */}
        <h2 className="mt-2 text-balance font-display text-[clamp(1.4rem,6.9vw,1.875rem)] font-bold leading-tight sm:text-4xl sm:max-lg:text-[clamp(1.6rem,4.3vw,2.25rem)]">{a.title}</h2>
        {a.text.map((t) => <p key={t} className="mt-4 text-night/65">{t}</p>)}
        {/* Planşetdə mətn tam endədir: siyahı solda, düymə sağda (siyahının alt xəttində); mobildə düymə siyahının altında, sağda */}
        <div className="max-sm:flex max-sm:flex-col max-sm:items-end sm:max-lg:flex sm:max-lg:items-end sm:max-lg:justify-between sm:max-lg:gap-6">
          {a.points.length > 0 && (
            <ul className="mt-6 space-y-3 max-sm:self-stretch">
              {a.points.map((p) => (
                <li key={p} className="flex items-center gap-3 font-semibold"><CircleCheck size={20} className="text-cold" /> {p}</li>
              ))}
            </ul>
          )}
          <Link href="/nece-isleyirik" className="mt-8 inline-flex h-12 shrink-0 items-center gap-2 rounded-full bg-cold px-6 font-bold text-white transition-colors hover:bg-night max-sm:w-full max-sm:justify-center sm:max-lg:mt-0">
            {t["home.about.button"]} <ArrowRight size={18} />
          </Link>
        </div>
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
      {/* Əsas çağırış kartı: tünd aurora fon + fırlanan işıqlı haşiyə (.glow-border) */}
      {/* Planşetdə kart tam endədir: iki bərabər yarı — solda başlıq, mətn və düymə; sağda məlumatlar şüşə plitələrdə */}
      <div className="glow-border aurora relative overflow-hidden rounded-[28px] bg-night p-8 text-white sm:p-10 sm:max-lg:grid sm:max-lg:grid-cols-2 sm:max-lg:gap-x-8">
        <div className="sm:max-lg:self-end">
          <p className="font-semibold text-cold">{t["home.contact.label"]}</p>
          <h2 className="mt-2 font-display text-3xl font-bold">{t["home.contact.title"]}</h2>
          <p className="mt-3 text-white/60">{t["home.contact.text"]}</p>
        </div>
        <ul className="mt-8 space-y-5 sm:max-lg:col-start-2 sm:max-lg:row-span-2 sm:max-lg:row-start-1 sm:max-lg:mt-0 sm:max-lg:space-y-3 sm:max-lg:self-center">
          {items.map(({ icon: Icon, label, value, href }) => (
            <li key={label} className="flex items-center gap-4 sm:max-lg:rounded-2xl sm:max-lg:bg-white/[0.06] sm:max-lg:p-3 sm:max-lg:ring-1 sm:max-lg:ring-white/10">
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-white/10 text-cold"><Icon size={20} /></span>
              <span>
                <span className="block text-xs text-white/50">{label}</span>
                {href ? <a href={href} className="font-semibold hover:text-cold">{value}</a> : <span className="font-semibold">{value}</span>}
              </span>
            </li>
          ))}
        </ul>
        <Link href="/elaqe" className="mt-8 inline-flex h-12 items-center gap-2 rounded-full bg-cold px-6 font-bold transition-colors hover:bg-white hover:text-night max-sm:w-full max-sm:justify-center sm:max-lg:col-start-1 sm:max-lg:row-start-2 sm:max-lg:mt-6 sm:max-lg:self-start sm:max-lg:justify-self-start">
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
      <section className="relative grid overflow-hidden bg-gradient-to-br from-night via-[#0b3a5c] to-cold text-white">
        <Suspense fallback={null}>
          <HeroBackground />
        </Suspense>
        <div className="pointer-events-none absolute inset-0 bg-[repeating-linear-gradient(90deg,rgba(255,255,255,0.04)_0_1px,transparent_1px_32px)]" aria-hidden="true" />
        {/* < 1024: mətn aşağıda, şəklin yuxarısındakı kondisioner açıq qalır */}
        <div className="site-wrap relative col-start-1 row-start-1 w-full self-center pb-24 pt-16 max-lg:self-end">
          <div className="max-w-2xl">
            <div className="hero-in flex flex-wrap gap-2 text-sm font-semibold">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-heat/20 px-3 py-1.5 text-[#ffd08a]"><Sun size={15} /> {t["home.hero.badge_out"]}</span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1.5 text-ice"><Snowflake size={15} /> {t["home.hero.badge_in"]}</span>
            </div>
            <HeroTitle text={t["home.hero.title"]} className="mt-6 text-balance font-display text-4xl font-bold leading-[1.05] sm:text-5xl lg:text-6xl" />
            <p className="hero-in mt-5 max-w-xl text-lg text-white/75" style={{ "--d": "420ms" } as React.CSSProperties}>
              {t["home.hero.lead"]}
            </p>
            <div className="hero-in" style={{ "--d": "520ms" } as React.CSSProperties}>
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

      {/* Xidmət kateqoriyaları: tünd "aurora" fonda üç bərabər şüşə kart */}
      <section className="aurora relative overflow-hidden bg-night py-24 text-white">
        <Snowflake size={420} strokeWidth={0.5} className="pointer-events-none absolute -left-24 -top-24 text-white/[0.06]" aria-hidden="true" />
        <div className="site-wrap relative">
          <Reveal>
            <SectionTitle title={t["home.categories.title"]} lead={t["home.categories.lead"]} light />
          </Reveal>
          <div className="mt-12 grid gap-5 lg:grid-cols-3">
            {CATEGORIES.map(({ icon: Icon, title, items }, i) => (
              <Reveal key={title} delay={i * 100} className="h-full">
                <Spotlight className="h-full rounded-[28px]">
                  <div className="bento-card h-full rounded-[28px] p-7">
                    <div className="flex items-center gap-4">
                      <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-cold/15 text-cold ring-1 ring-cold/30">
                        <Icon size={26} />
                      </span>
                      <h3 className="font-display text-lg font-bold leading-tight">{t[title]}</h3>
                    </div>
                    {/* Planşetdə kart tam endədir: siyahı 2 sütuna bölünür (ayırıcı xətt hər sütunun ilk bəndində yoxdur) */}
                    <ul className="mt-6 sm:max-lg:grid sm:max-lg:grid-cols-2 sm:max-lg:gap-x-8">
                      {lines(t[items]).map((item) => (
                        <li key={item} className="flex items-center gap-3 border-t border-white/10 py-3 font-medium text-white/85 first:border-t-0 sm:max-lg:nth-2:border-t-0">
                          <CircleCheck size={18} className="shrink-0 text-cold" /> {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </Spotlight>
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
