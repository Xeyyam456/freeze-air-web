import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { ArrowRight, Briefcase, Users } from "lucide-react";
import { PageIntro } from "@/components/landing/PageIntro";
import { initials } from "@/lib/experience";
import { getPublicEmployees, getPublicManagement } from "@/lib/public-employees";
import { getTexts, pageTitle, type Texts } from "@/lib/site-texts";

export async function generateMetadata(): Promise<Metadata> {
  return { title: await pageTitle("team.title") };
}

// Rəhbərlik: üfüqi kartlar (şəkil + ad + vəzifə), ustalardan əvvəl. Rəhbərlik yoxdursa bölmə çıxmır.
async function ManagementList({ t }: { t: Texts }) {
  const managers = await getPublicManagement();
  if (managers.length === 0) return null;

  return (
    <section className="site-wrap mb-12">
      <h2 className="mb-5 font-display text-2xl font-bold sm:text-3xl">{t["team.management"]}</h2>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {managers.map((m) => (
          <article key={m.id} className="flex items-center gap-5 rounded-[24px] bg-white p-4">
            <span className="h-24 w-24 shrink-0 overflow-hidden rounded-[18px] bg-gradient-to-br from-ice to-glacier">
              {m.photo_url ? (
                // eslint-disable-next-line @next/next/no-img-element -- storage şəkli
                <img src={m.photo_url} alt={m.full_name} className="h-full w-full object-cover" />
              ) : (
                <span className="grid h-full w-full place-items-center bg-gradient-to-br from-night to-cold font-display text-3xl font-bold text-white">
                  {initials(m.full_name)}
                </span>
              )}
            </span>
            <span className="min-w-0">
              <span className="block font-display text-lg font-bold leading-tight">{m.full_name}</span>
              <span className="mt-1.5 inline-block rounded-full bg-glacier px-3 py-1 text-xs font-bold text-cold">{m.job_title}</span>
            </span>
          </article>
        ))}
      </div>
    </section>
  );
}

async function EmployeeGrid({ t }: { t: Texts }) {
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

  return (
    <section className="site-wrap grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {employees.map((e) => (
        <article key={e.id}
          className="group flex flex-col rounded-[24px] border border-night/5 bg-white p-3 transition-shadow hover:shadow-[0_18px_40px_rgba(6,25,43,0.1)]">
          {/* Şəkil kartın enində, kvadrat; ixtisas şəklin üstündə nişan */}
          <div className="relative aspect-square overflow-hidden rounded-[18px] bg-gradient-to-br from-ice to-glacier">
            {e.photo_url ? (
              // eslint-disable-next-line @next/next/no-img-element -- xarici/storage şəkli, optimizasiya lazım deyil
              <img src={e.photo_url} alt={e.full_name}
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
            ) : (
              <span className="grid h-full w-full place-items-center bg-gradient-to-br from-cold to-night font-display text-6xl font-bold text-white">
                {initials(e.full_name)}
              </span>
            )}
            <span className="absolute bottom-3 left-3 rounded-full bg-white/90 px-3 py-1 text-xs font-bold text-night shadow-sm backdrop-blur">
              {e.specialty ?? t["team.specialty"]}
            </span>
          </div>
          <div className="flex flex-1 flex-col gap-4 px-2 pb-1 pt-4">
            <h2 className="font-display text-lg font-bold leading-tight">{e.full_name}</h2>
            <div className="mt-auto flex items-center gap-2 border-t border-night/10 pt-3 text-sm text-night/60">
              <Briefcase size={15} className="shrink-0 text-cold" />
              {e.experience ? <span>{t["team.experience"]} <b className="font-semibold text-night">{e.experience}</b></span> : <span>{t["team.new"]}</span>}
            </div>
          </div>
        </article>
      ))}
    </section>
  );
}

export default async function TeamPage() {
  const t = await getTexts();
  return (
    <>
      <PageIntro title={t["team.title"]} lead={t["team.lead"]} />
      <Suspense fallback={<div className="site-wrap mb-12"><div className="h-32 rounded-[24px] bg-white/60" /></div>}>
        <ManagementList t={t} />
      </Suspense>
      <h2 className="site-wrap mb-5 font-display text-2xl font-bold sm:text-3xl">{t["team.masters"]}</h2>
      <Suspense fallback={<div className="site-wrap"><div className="h-80 rounded-[28px] bg-white/60" /></div>}>
        <EmployeeGrid t={t} />
      </Suspense>
      <section className="site-wrap mt-6">
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-[28px] bg-night px-7 py-6 text-white">
          <p className="text-lg">{t["team.cta_text"]}</p>
          <Link href="/elaqe" className="inline-flex h-11 items-center gap-2 rounded-full bg-cold px-5 font-bold transition-colors hover:bg-white hover:text-night">
            {t["team.cta_button"]} <ArrowRight size={16} />
          </Link>
        </div>
      </section>
    </>
  );
}
