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
      <article className="group flex h-full items-center gap-6 rounded-[28px] bg-white p-4 pr-7 ring-1 ring-night/5 transition-[box-shadow,transform] duration-300 hover:-translate-y-1 hover:shadow-[0_24px_50px_rgba(6,25,43,0.12)]">
        <span className="relative h-32 w-32 shrink-0 overflow-hidden rounded-[22px] bg-gradient-to-br from-ice to-glacier">
          {e.photo_url ? (
            // eslint-disable-next-line @next/next/no-img-element -- storage şəkli
            <img src={e.photo_url} alt={e.full_name} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
          ) : (
            <span className="grid h-full w-full place-items-center bg-gradient-to-br from-cold to-night font-display text-3xl font-bold text-white">
              {initials(e.full_name)}
            </span>
          )}
        </span>
        <div className="min-w-0 flex-1">
          {/* İxtisas solda, iş növü sağda sakit haşiyəli həb (şəklin üstündəki nişan bəyənilmədi: tünd və şüşə variantları) */}
          <div className="flex items-start justify-between gap-3">
            <p className="text-sm font-bold text-cold">{e.specialty ?? t["team.specialty"]}</p>
            <span className="shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold text-night/55 ring-1 ring-night/10">
              {t[typeKey(e.worker_type)]}
            </span>
          </div>
          <h2 className="mt-1 truncate font-display text-xl font-bold leading-tight">{e.full_name}</h2>
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
    <section className="site-wrap grid items-start gap-6 lg:grid-cols-[380px_1fr]">
      <Reveal className="lg:sticky lg:top-24">
        <aside className="glow-border aurora relative overflow-hidden rounded-[32px] bg-night p-8 text-white">
          {/* Komanda növlərə görə: usta, köməkçi, sürücü (admin işə qəbulda seçir; üçü də həmişə göstərilir, istifadəçi istəyi).
              Təcrübə illərinin cəmi ("41+ il") peşəkar görünmürdü, istifadəçi istəyi ilə çıxarıldı. */}
          <dl className="grid gap-3">
            {TYPES.map(({ key, icon: Icon }) => (
              <div key={key} className="flex items-center gap-4 rounded-[20px] bg-white/[0.06] p-4 ring-1 ring-white/10">
                <span className="grid h-11 w-11 place-items-center rounded-2xl bg-cold/15 text-cold ring-1 ring-cold/30"><Icon size={20} /></span>
                <dt className="flex-1 text-white/70">{t[`team.type.${key}`]}</dt>
                <dd className="font-display text-3xl font-bold"><CountUp value={String(counts[key])} /></dd>
              </div>
            ))}
          </dl>
          <p className="mt-8 font-display text-2xl font-bold leading-snug">{t["team.cta_text"]}</p>
          <Link href="/elaqe" className="mt-6 inline-flex h-12 items-center gap-2 rounded-full bg-cold px-7 font-bold transition-all hover:-translate-y-px hover:bg-white hover:text-night">
            {t["team.cta_button"]} <ArrowRight size={18} />
          </Link>
        </aside>
      </Reveal>

      <div className="grid gap-5 xl:grid-cols-2">
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
