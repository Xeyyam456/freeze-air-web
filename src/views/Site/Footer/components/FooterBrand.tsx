import Link from "next/link";
import { Suspense } from "react";
import { LogIn, Snowflake } from "lucide-react";
import type { FooterBrandProps } from "@/types/site";
import { FooterSocial } from "./FooterSocial";

// Brend sütunu: loqo + ad, izah mətni, "Usta girişi" və sosial düymələr.
// Planşetdə tam enli sıra (solda loqo + mətn, sağda giriş + sosial); mobildə mərkəzdə, "Usta girişi" boş yeri tutur
export function FooterBrand({ t, logo }: FooterBrandProps) {
  return (
    <div className="max-sm:col-span-2 sm:max-lg:col-span-3 sm:max-lg:flex sm:max-lg:items-center sm:max-lg:justify-between sm:max-lg:gap-8 sm:max-lg:border-b sm:max-lg:border-white/10 sm:max-lg:pb-10">
      <div>
        <Link href="/" className="flex items-center gap-3 max-sm:justify-center">
          {logo
            // Tünd fonda: loqo ağ kartın içində, rəngli loqo da görünsün
            // eslint-disable-next-line @next/next/no-img-element -- storage şəkli
            ? <span className="grid h-11 place-items-center rounded-2xl bg-white px-2"><img src={logo} alt={t["brand.name"]} className="h-8 w-auto max-w-[140px] object-contain" /></span>
            : (
              <span className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-cold to-[#0b3a5c]">
                <Snowflake size={22} strokeWidth={2.2} />
              </span>
            )}
          <span className="font-display text-lg font-bold">{t["brand.name"]}</span>
        </Link>
        <p className="mt-5 max-w-xs text-white/55 max-sm:mx-auto">{t["footer.text"]}</p>
      </div>
      <div className="max-sm:mt-6 max-lg:flex max-lg:shrink-0 max-lg:items-center max-lg:gap-3">
        <Link href="/login" className="mt-6 inline-flex h-10 items-center gap-2 rounded-full border border-white/20 px-4 text-sm font-bold text-white/80 transition-colors hover:border-white hover:text-white max-lg:mt-0 max-sm:h-11 max-sm:flex-1 max-sm:justify-center">
          <LogIn size={15} /> {t["footer.login"]}
        </Link>
        <Suspense fallback={null}>
          <FooterSocial title={t["footer.social"]} />
        </Suspense>
      </div>
    </div>
  );
}
