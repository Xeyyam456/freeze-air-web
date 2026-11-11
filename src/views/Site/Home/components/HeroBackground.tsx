import Image from "next/image";
import { AirflowCanvas } from "./AirflowCanvas";
import { DropsCanvas } from "./DropsCanvas";
import { SnowCanvas } from "./SnowCanvas";
import { HeroCold } from "./HeroCold";
import { HeroSun } from "./HeroSun";
import { HeroSteam } from "./HeroSteam";
import { getHomeContent } from "@/services/site/fetchSiteSettings.server";

const TINT = "pointer-events-none relative col-start-1 row-start-1 transition-opacity duration-700";

// Hero arka planı: şəkil bazadan (admin → Sayt → Ana səhifə); yoxdursa bölmənin gradient fonu qalır.
// Soldan sağa tünd overlay mətnin oxunmasını təmin edir, şəklin sağ tərəfi açıq qalır.
// Temperatur sürgüsü (HeroClimate) CSS dəyişənləri qoyur: --warm/--frost (ilıq ton, buzlu haşiyə),
// --sun (25°+: günəş şüaları), --cold (20°-: soyuq hava axını); qar (--cold, SnowCanvas); 16–18°-də şüşədə buxar və süzülən damcılar (--steam).
export async function HeroBackground() {
  const { heroImage: url } = await getHomeContent();
  if (!url) return null;
  return (
    <>
      <Image width={1600} height={1000} sizes="100vw" preload fetchPriority="high" src={url} alt="" className="hero-parallax col-start-1 row-start-1 block h-[calc(100svh-77px)] min-h-[560px] w-full object-cover object-top max-xl:object-right-top max-sm:object-[86%_top]" />
      {/* relative: şəkil parallax üçün transform alır və qat yaradır; overlay onun üstündə qalsın deyə o da mövqeli olmalıdır */}
      <div className="relative col-start-1 row-start-1 bg-gradient-to-r from-night/90 via-night/65 to-night/10" aria-hidden="true" />
      <div className={`${TINT} bg-[radial-gradient(ellipse_at_78%_25%,rgba(255,205,120,0.3),rgba(255,175,80,0.12)_45%,transparent_78%)]`} style={{ opacity: "calc(var(--warm, 0) * 0.55)" }} aria-hidden="true" />
      <div className={`${TINT} shadow-[inset_0_0_140px_rgba(170,225,255,0.45)]`} style={{ opacity: "var(--frost, 0)" }} aria-hidden="true" />
      <HeroSun />
      <HeroCold />
      <HeroSteam />
      <AirflowCanvas />
      <DropsCanvas />
      <SnowCanvas />
    </>
  );
}
