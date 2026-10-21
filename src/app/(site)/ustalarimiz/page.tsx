import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { ArrowRight, Briefcase, HardHat, Truck, Users, Wrench } from "lucide-react";
import { CountUp } from "@/components/landing/CountUp";
import { PageIntro } from "@/components/landing/PageIntro";
import { Reveal } from "@/components/landing/Reveal";
import { Spotlight } from "@/components/landing/Spotlight";
import { initials } from "@/lib/experience";
import { getPublicEmployees, type PublicEmployee } from "@/lib/public-employees";
import { getTexts, pageTitle, type Texts } from "@/lib/site-texts";

export async function generateMetadata(): Promise<Metadata> {
  return { title: await pageTitle("team.title") };
}

// İş növləri (bazada employees.worker_type); adları saytın mətnlərindən: team.type.*
type WorkerType = "master" | "assistant" | "driver";
const TYPES: { key: WorkerType; icon: typeof Wrench }[] = [
  { key: "master", icon: Wrench },
  { key: "assistant", icon: HardHat },
  { key: "driver", icon: Truck },
];
const typeKey = (type: string) => `team.type.${(TYPES.find((ty) => ty.key === type) ?? TYPES[0]).key}` as const;

// Usta kartı (üfüqi, yığcam): solda şəkil, sağda ixtisas, ad və təcrübə; təcrübə zolağı ən təcrübəli ustaya nisbətlə dolur.
function MasterCard({ e, max, t }: { e: PublicEmployee; max: number; t: Texts }) {
  const share = max > 0 ? Math.max(6, Math.round((e.months / max) * 100)) : 0;
  return (
    <Spotlight className="h-full rounded-[28px]">
      {/* Şəkil kartın eninə görə: 128px, planşetin iki sütununda 96px, mobildə 80px */}
      <article className="group flex h-full items-center gap-6 rounded-[28px] bg-white p-4 pr-7 ring-1 ring-night/5 transition-[box-shadow,transform] duration-300 hover:-translate-y-1 hover:shadow-[0_24px_50px_rgba(6,25,43,0.12)] max-sm:gap-4 max-sm:pr-5 md:max-lg:gap-5">
        <span className="relative h-32 w-32 shrink-0 overflow-hidden rounded-[22px] bg-gradient-to-br from-ice to-glacier max-sm:h-20 max-sm:w-20 max-sm:rounded-[18px] md:max-lg:h-24 md:max-lg:w-24">
          {e.photo_url ? (
            // eslint-disable-next-line @next/next/no-img-element -- storage şəkli
            <img src={e.photo_url} alt={e.full_name} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
          ) : (
            <span className="grid h-full w-full place-items-center bg-gradient-to-br from-cold to-night font-display text-3xl font-bold text-white">
              {initials(e.full_name)}
            </span>
          )}
        </span>
        <div className="@container min-w-0 flex-1">
          {/* İxtisas solda, iş növü sağda sakit haşiyəli həb (şəklin üstündəki nişan bəyənilmədi: tünd və şüşə variantları).
              İxtisas bir sətirdə, kəsilmədən (2 sətrə düşəndə ad xətti pozulurdu): şrift kartın eninə görə, 84px = həb + ara; < 400px həb gizli (ixtisas 9px-ə düşürdü) */}
          <div className="flex items-center justify-between gap-3">
            <p className="truncate text-[min(0.875rem,calc((100cqi-84px)/9.2))] font-bold text-cold max-[400px]:text-[min(0.875rem,calc(100cqi/9.2))]">{e.specialty ?? t["team.specialty"]}</p>
            <span className="shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold text-night/55 ring-1 ring-night/10 max-[400px]:hidden">
              {t[typeKey(e.worker_type)]}
            </span>
          </div>
          {/* Ad bir sətirdə, kəsilmədən: şrift kartın eninə görə */}
          <h2 className="mt-1 truncate font-display text-[min(1.25rem,calc(100cqi/11.2))] font-bold leading-tight">{e.full_name}</h2>
          <div className="mt-4 flex items-center gap-2 text-sm text-night/60">
            <Briefcase size={15} className="shrink-0 text-cold" />
            {e.experience ? <span>{t["team.experience"]} <b className="font-semibold text-night">{e.experience}</b></span> : <span>{t["team.new"]}</span>}
          </div>
          {/* Təcrübə zolağı: görünəndə dolur (.stat-bar animasiyası) */}
          <span className="mt-2.5 block h-1.5 overflow-hidden rounded-full bg-glacier" aria-hidden="true">
            <span className="stat-bar" style={{ width: `${share}%`, height: "100%" }} />
          </span>
        </div>
      </article>
    </Spotlight>
  );
}

// Səhifə: solda yapışan tünd panel (komanda göstəriciləri + çağırış), sağda iki sütunlu usta kartları.
// Rəhbərlik kartları istifadəçi istəyi ilə çıxarılıb (2026-10-20); iri portret kartlar da bəyənilmədi.
async function Team({ t }: { t: Texts }) {
  const employees = await getPublicEmployees();

  if (employees.length === 0) {
    return (
      <div className="site-wrap">
        <div className="rounded-[28px] bg-white p-12 text-center text-night/60">
          <Users size={28} className="mx-auto text-cold" />
          <p className="mt-3">{t["team.empty"]}</p>
        </div>
      </div>
    );
  }

  const max = Math.max(...employees.map((e) => e.months));
  const counts = Object.fromEntries(TYPES.map((ty) => [ty.key, employees.filter((e) => e.worker_type === ty.key).length])) as Record<WorkerType, number>;

  return (
    // grid-cols-[minmax(0,1fr)]: sütun məzmunun eninə görə genişlənməsin (mobildə 409px-dən aşağı daralmırdı, səhifə daşırdı)
    <section className="site-wrap grid grid-cols-[minmax(0,1fr)] items-start gap-6 lg:grid-cols-[380px_minmax(0,1fr)]">
      <Reveal className="lg:sticky lg:top-24">
        {/* < 1024 panel tam endədir: göstəricilər üç sütunda (ikon, say, ad — mərkəzdə), çağırış mətni mərkəzdə, "Usta çağır" tam endə */}
        <aside className="glow-border aurora relative overflow-hidden rounded-[32px] bg-night p-8 text-white max-sm:p-5">
          {/* Komanda növlərə görə: usta, köməkçi, sürücü (admin işə qəbulda seçir; üçü də həmişə göstərilir, istifadəçi istəyi).
              Təcrübə illərinin cəmi ("41+ il") peşəkar görünmürdü, istifadəçi istəyi ilə çıxarıldı. */}
          <dl className="grid gap-3 sm:max-lg:grid-cols-3">
            {TYPES.map(({ key, icon: Icon }) => (
              <div key={key} className="flex items-center gap-4 rounded-[20px] bg-white/[0.06] p-4 ring-1 ring-white/10 sm:max-lg:flex-col sm:max-lg:gap-2 sm:max-lg:py-5">
                <span className="grid h-11 w-11 place-items-center rounded-2xl bg-cold/15 text-cold ring-1 ring-cold/30"><Icon size={20} /></span>
                <dt className="flex-1 text-white/70 sm:max-lg:order-last sm:max-lg:flex-none">{t[`team.type.${key}`]}</dt>
                <dd className="font-display text-3xl font-bold"><CountUp value={String(counts[key])} /></dd>
              </div>
            ))}
          </dl>
          <p className="mt-8 text-balance font-display text-2xl font-bold leading-snug max-lg:text-center max-sm:mt-6 max-sm:text-xl">{t["team.cta_text"]}</p>
          <Link href="/elaqe" className="mt-6 inline-flex h-12 items-center justify-center gap-2 rounded-full bg-cold px-7 font-bold transition-all hover:-translate-y-px hover:bg-white hover:text-night max-lg:w-full max-sm:mt-5">
            {t["team.cta_button"]} <ArrowRight size={18} />
          </Link>
        </aside>
      </Reveal>

      {/* Usta kartları: 768–1023 və ≥ 1280 iki sütun; 1024–1279 bir (panelin yanında dar), < 768 bir */}
      <div className="grid gap-5 md:max-lg:grid-cols-2 xl:grid-cols-2">
        {employees.map((e, i) => (
          <Reveal key={e.id} delay={(i % 2) * 100} className="h-full">
            <MasterCard e={e} max={max} t={t} />
          </Reveal>
        ))}
      </div>
    </section>
  );
}

export default async function TeamPage() {
  const t = await getTexts();
  return (
    <>
      <PageIntro title={t["team.title"]} lead={t["team.lead"]} />
      <Suspense fallback={<div className="site-wrap"><div className="h-96 rounded-[32px] bg-white/60" /></div>}>
        <Team t={t} />
      </Suspense>
    </>
  );
}
