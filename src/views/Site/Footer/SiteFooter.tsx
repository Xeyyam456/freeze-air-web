import Link from "next/link";
import { Suspense } from "react";
import { Snowflake } from "lucide-react";
import { sitePages } from "@/components/landing/content";
import { getLogo } from "@/lib/site-settings";
import { getTexts } from "@/lib/site-texts";
import { FooterBrand } from "./components/FooterBrand";
import { FooterContact } from "./components/FooterContact";
import { FooterServices } from "./components/FooterServices";
import { FOOTER_HEADING } from "./constants/footerStyles";

// Footer: tünd blok, yuxarıda istidən soyuğa şkala; 4 sütun və alt zolaq. Mətnlər bazadan.
// Planşetdə yuxarıda tam enli brend sırası, altında 3 sütun (enlər məzmuna görə). Mobildə hər şey mərkəzdə:
// brend, düymələr, altında Səhifələr + Əlaqə yan-yana (Xidmətlər gizli, ☰ menyuda var)
export async function SiteFooter() {
  const [t, logo] = await Promise.all([getTexts(), getLogo()]);
  return (
    <footer className="mt-12 bg-night text-white lg:mt-20">
      <div className="h-1.5 w-full bg-gradient-to-r from-heat via-ice to-cold" aria-hidden="true" />

      <div className="site-wrap relative grid grid-cols-[0.75fr_1.25fr] gap-x-4 gap-y-10 max-sm:text-center overflow-hidden py-16 sm:grid-cols-[0.8fr_1fr_1.35fr] sm:gap-x-8 lg:grid-cols-[1.3fr_1fr_1fr_1fr] lg:gap-x-10">
        <FooterBrand t={t} logo={logo} />

        <div>
          <p className={`${FOOTER_HEADING} max-sm:justify-center`}>{t["footer.pages"]}</p>
          {/* Mobildə Əlaqə kimi: siyahı blok olaraq mərkəzdə, sətirlər bir xətdən (solda) başlayır */}
          <ul className="mt-5 space-y-3 max-sm:mx-auto max-sm:w-fit max-sm:text-left">
            {sitePages(t).map((p) => (
              <li key={p.href}><Link href={p.href} className="text-white/65 transition-colors hover:text-cold">{p.label}</Link></li>
            ))}
          </ul>
        </div>

        <div className="max-sm:hidden">
          <p className={FOOTER_HEADING}>{t["footer.services"]}</p>
          <ul className="mt-5 space-y-3">
            <Suspense fallback={null}>
              <FooterServices />
            </Suspense>
          </ul>
        </div>

        <div className="min-w-0">
          <p className={`${FOOTER_HEADING} max-sm:justify-center`}>{t["footer.contact"]}</p>
          {/* Mobildə siyahı blok kimi mərkəzdə, içində ikonlar bir şaquli xətdə (sətirlər sola düzlənir) */}
          <ul className="mt-5 space-y-4 text-white/65 max-sm:mx-auto max-sm:w-fit max-sm:text-left max-sm:text-sm [overflow-wrap:anywhere]">
            <Suspense fallback={null}>
              <FooterContact />
            </Suspense>
          </ul>
        </div>

        <Snowflake size={380} strokeWidth={0.5} className="pointer-events-none absolute -bottom-40 -right-20 text-white/[0.04]" aria-hidden="true" />
      </div>

      <div className="border-t border-white/10">
        <div className="site-wrap flex flex-wrap items-center justify-between gap-3 py-5 text-sm text-white/45 max-sm:flex-col max-sm:gap-1 max-sm:text-center">
          <span>{t["footer.copyright"]}</span>
          <span>{t["footer.slogan"]}</span>
        </div>
      </div>
    </footer>
  );
}
