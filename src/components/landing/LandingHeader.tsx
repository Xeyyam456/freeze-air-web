import Link from "next/link";
import { Suspense } from "react";
import { LayoutGrid, LogIn, Phone, Snowflake } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getContact, getLogo, telHref } from "@/lib/site-settings";
import { getServices } from "@/lib/site-content";
import { getTexts, type Texts } from "@/lib/site-texts";
import { sitePages } from "./content";
import { SiteNav } from "./SiteNav";

const accountClass =
  "grid h-11 w-11 place-items-center rounded-full text-night/60 ring-1 ring-night/10 transition-colors hover:bg-night hover:text-white hover:ring-night";

// Qonaq "Daxil ol", giriş etmiş usta isə "Panelə keç" görür (ikon düymə, ad title-da)
async function AccountButton({ t }: { t: Texts }) {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();

  return data?.claims ? (
    <Link href="/panel" className={accountClass} title={t["header.panel"]} aria-label={t["header.panel"]}><LayoutGrid size={18} /></Link>
  ) : (
    <Link href="/login" className={accountClass} title={t["header.login"]} aria-label={t["header.login"]}><LogIn size={18} /></Link>
  );
}

// Bir sətirli yapışan header: solda loqo, ortada menyu (həb düymələr), sağda telefon, "Usta çağır" və hesab.
// Şüşə fon (yarımşəffaf ağ + bulanıqlıq); sürüşəndə kölgə alır (.site-header, motion.css). Mətnlər bazadan.
export async function LandingHeader() {
  const [t, logo, services, contact] = await Promise.all([getTexts(), getLogo(), getServices(), getContact()]);
  const tel = telHref(contact.phone);
  return (
    <header className="site-header sticky top-0 z-30 border-b border-night/[0.06] bg-white/85 backdrop-blur-xl backdrop-saturate-150">
      <div className="site-wrap flex h-[76px] items-center gap-6">
        <Link href="/" className="flex shrink-0 items-center gap-3">
          {logo
            // eslint-disable-next-line @next/next/no-img-element -- storage şəkli
            ? <img src={logo} alt={t["brand.name"]} className="h-11 w-auto max-w-[170px] object-contain" />
            : (
              <span className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-cold to-night text-white shadow-[0_8px_20px_rgba(0,163,217,0.35)]">
                <Snowflake size={22} strokeWidth={2.2} />
              </span>
            )}
          <span className="leading-tight">
            <span className="block font-display text-[17px] font-bold text-night">{t["brand.name"]}</span>
            <span className="block text-xs font-medium text-night/50 max-[1500px]:hidden">{t["brand.tagline"]}</span>
          </span>
        </Link>

        <SiteNav className="mx-auto" pages={sitePages(t)} services={services.map((s) => ({ slug: s.slug, title: s.title }))} />

        <div className="flex shrink-0 items-center gap-2">
          {tel && (
            <a href={tel} className="hidden items-center gap-2.5 rounded-full py-1.5 pl-1.5 pr-3 text-sm font-bold text-night transition-colors hover:bg-glacier lg:inline-flex" title={contact.phone}>
              <span className="grid h-9 w-9 place-items-center rounded-full bg-cold/10 text-cold"><Phone size={16} /></span>
              <span className="max-[1600px]:hidden">{contact.phone}</span>
            </a>
          )}
          <Link href="/elaqe" className="hidden h-11 items-center rounded-full bg-night px-6 text-sm font-bold text-white shadow-[0_10px_24px_rgba(6,25,43,0.25)] transition-all hover:-translate-y-px hover:bg-cold hover:shadow-[0_12px_28px_rgba(0,163,217,0.35)] sm:inline-flex">
            {t["header.cta"]}
          </Link>
          <Suspense fallback={<span className={`${accountClass} opacity-40`} />}>
            <AccountButton t={t} />
          </Suspense>
        </div>
      </div>
    </header>
  );
}
