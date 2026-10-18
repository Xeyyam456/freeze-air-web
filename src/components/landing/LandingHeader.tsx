import Link from "next/link";
import { Suspense } from "react";
import { LayoutGrid, LogIn, Snowflake } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getLogo } from "@/lib/site-settings";
import { getServices } from "@/lib/site-content";
import { getTexts, type Texts } from "@/lib/site-texts";
import { sitePages } from "./content";
import { SiteNav } from "./SiteNav";

const accountClass =
  "inline-flex h-11 items-center gap-2 rounded-full border border-night/15 px-5 text-sm font-bold text-night transition-colors hover:border-night";

// Qonaq "Daxil ol", giriş etmiş usta isə "Panelə keç" görür
async function AccountButton({ t }: { t: Texts }) {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();

  return data?.claims ? (
    <Link href="/panel" className={accountClass}><LayoutGrid size={16} /> {t["header.panel"]}</Link>
  ) : (
    <Link href="/login" className={accountClass}><LogIn size={16} /> {t["header.login"]}</Link>
  );
}

// İki qat: ağ loqo zolağı → göy menyu (yalnız menyu yuxarıda yapışıb qalır). Mətnlər bazadan.
export async function LandingHeader() {
  const [t, logo, services] = await Promise.all([getTexts(), getLogo(), getServices()]);
  return (
    <>
      <div className="bg-white">
        <div className="site-wrap flex h-20 items-center gap-6">
          <Link href="/" className="flex shrink-0 items-center gap-3">
            {logo
              // eslint-disable-next-line @next/next/no-img-element -- storage şəkli
              ? <img src={logo} alt={t["brand.name"]} className="h-12 w-auto max-w-[180px] object-contain" />
              : (
                <span className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-cold to-night text-white">
                  <Snowflake size={24} strokeWidth={2.2} />
                </span>
              )}
            <span className="leading-tight">
              <span className="block font-display text-lg font-bold text-night">{t["brand.name"]}</span>
              <span className="block text-xs font-medium text-night/50">{t["brand.tagline"]}</span>
            </span>
          </Link>
          <div className="ml-auto flex items-center gap-3">
            <Link href="/elaqe" className="hidden h-11 items-center rounded-full bg-cold px-5 text-sm font-bold text-white transition-colors hover:bg-night sm:inline-flex">
              {t["header.cta"]}
            </Link>
            <Suspense fallback={<span className={`${accountClass} w-36 opacity-40`} />}>
              <AccountButton t={t} />
            </Suspense>
          </div>
        </div>
      </div>

      <header className="sticky top-0 z-30 bg-cold shadow-[0_6px_20px_rgba(6,25,43,0.15)]">
        <div className="site-wrap">
          <SiteNav pages={sitePages(t)} services={services.map((s) => ({ slug: s.slug, title: s.title }))} />
        </div>
      </header>
    </>
  );
}
