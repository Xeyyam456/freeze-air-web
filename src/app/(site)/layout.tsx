import { Unbounded } from "next/font/google";
import { LandingHeader } from "@/components/landing/LandingHeader";
import { SiteFooter } from "@/components/landing/SiteFooter";

// Başlıq şrifti (termostat displeyini xatırladan geniş həndəsi şrift); latin-ext: ə, ğ, ş, ı
const unbounded = Unbounded({
  variable: "--font-unbounded",
  subsets: ["latin", "latin-ext"],
  weight: ["500", "700"],
});

// Açıq sayt (qonaqlar): landing, avadanlıq, xidmətlər, necə işləyirik, əlaqə
export default function SiteLayout({ children }: LayoutProps<"/">) {
  return (
    <div className={`${unbounded.variable} min-h-screen bg-glacier text-night`}>
      <LandingHeader />
      <main>{children}</main>
      <SiteFooter />
    </div>
  );
}
