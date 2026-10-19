import { Unbounded } from "next/font/google";
import { Suspense } from "react";
import { LandingHeader } from "@/components/landing/LandingHeader";
import { SiteFooter } from "@/components/landing/SiteFooter";
import "./motion.css";

// Başlıq şrifti (termostat displeyini xatırladan geniş həndəsi şrift); latin-ext: ə, ğ, ş, ı
const unbounded = Unbounded({
  variable: "--font-unbounded",
  subsets: ["latin", "latin-ext"],
  weight: ["500", "700"],
});

// Açıq sayt (qonaqlar): landing, avadanlıq, xidmətlər, necə işləyirik, əlaqə.
// Header, səhifə və footer bazadan (5 san. keşlə) oxuyur: keş "qısa ömürlü" sayıldığı üçün hər biri öz <Suspense>
// sərhədindədir (yoxsa Next 16 dev-də qırmızı "uncached data outside Suspense" xətası verir, build də uğursuz ola bilər).
// Fallback-lar header/footer ilə eyni hündürlükdədir: keş isti olanda görünmür, soyuq olanda səhifə tullanmır.
export default function SiteLayout({ children }: LayoutProps<"/">) {
  return (
    <div className={`${unbounded.variable} min-h-screen bg-glacier text-night`}>
      <Suspense fallback={<><div className="h-20 bg-white" /><div className="h-11 bg-cold" /></>}>
        <LandingHeader />
      </Suspense>
      <Suspense fallback={<div className="min-h-[60vh]" />}>
        <main>{children}</main>
      </Suspense>
      <Suspense fallback={<div className="h-64 bg-night" />}>
        <SiteFooter />
      </Suspense>
    </div>
  );
}
