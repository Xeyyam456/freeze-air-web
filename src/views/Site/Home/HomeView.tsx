import { Suspense } from "react";
import { LocalBusinessJsonLd } from "@/components/landing/LocalBusinessJsonLd";
import { Reveal } from "@/components/landing/Reveal";
import { SegmentCards, SegmentCardsSkeleton } from "@/components/landing/SegmentCards";
import { FaqSection } from "../Trust/components/FaqSection";
import { HowSteps } from "../Trust/components/HowSteps";
import { StatsStrip } from "../Trust/components/StatsStrip";
import { getTexts } from "@/services/site/fetchSiteTexts.server";
import { About } from "./components/About";
import { CategoriesSection } from "./components/CategoriesSection";
import { HeroSection } from "./components/HeroSection";
import { QuickContact } from "./components/QuickContact";
import { SectionTitle } from "./components/SectionTitle";

// Ana səhifə (açıq/tünd növbələşir): hero (tünd) → rəqəmlər → obyektlər (açıq) → necə işləyirik (tünd) →
// Haqqımızda (ağ) → kateqoriyalar (tünd) → FAQ (açıq) → əlaqə. Tünd bölmələrin kənarı qonşuya hamar keçir (EdgeFade).
export async function HomeView() {
  const t = await getTexts();
  return (
    <>
      <Suspense fallback={null}>
        <LocalBusinessJsonLd />
      </Suspense>
      <HeroSection t={t} />

      {/* İnam: rəqəmlər zolağı (hero-nun üstünə çıxır); ən azı 2 aktiv rəqəm yoxdursa göstərilmir */}
      <Suspense fallback={null}>
        <StatsStrip />
      </Suspense>

      {/* Xidmət: obyekt növlərinə görə (açıq, səhifə fonunda: ağ kartlar seçilir) */}
      <section className="py-20">
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

      {/* Necə işləyirik: 3 addım (tünd) */}
      <HowSteps t={t} />

      {/* Haqqımızda (ağ) */}
      <section className="bg-white">
        <div className="site-wrap grid items-center gap-12 py-20 lg:grid-cols-2">
          <Suspense fallback={<div className="min-h-[420px] rounded-[28px] bg-glacier lg:col-span-2" />}>
            <About t={t} />
          </Suspense>
        </div>
      </section>

      <CategoriesSection t={t} />

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
