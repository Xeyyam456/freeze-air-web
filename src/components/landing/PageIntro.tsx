import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { getTexts } from "@/lib/site-texts";
import { HeroTitle } from "./HeroTitle";

// Alt səhifələrin başlıq banneri: tünd aurora fon (ana səhifənin tünd bölmələri ilə eyni dil),
// yol (Əsas / [valideyn] / Səhifə), sözbəsöz açılan böyük başlıq, bir cümləlik izah
export async function PageIntro({ title, lead, parent }: {
  title: string;
  lead: string;
  parent?: { href: string; label: string };
}) {
  const t = await getTexts();
  return (
    <section className="aurora relative mb-14 overflow-hidden bg-night text-white">
      <div className="site-wrap relative py-16 sm:py-24">
        <nav className="hero-in flex items-center gap-1.5 text-sm text-white/55" aria-label="Yol">
          <Link href="/" className="transition-colors hover:text-white">{t["nav.home"]}</Link>
          <ChevronRight size={14} />
          {parent && (
            <>
              <Link href={parent.href} className="transition-colors hover:text-white">{parent.label}</Link>
              <ChevronRight size={14} />
            </>
          )}
          <span className="text-white">{title}</span>
        </nav>
        <HeroTitle text={title} className="mt-5 font-display text-4xl font-bold leading-[1.05] sm:text-6xl" />
        <p className="hero-in mt-5 max-w-2xl text-lg text-white/70" style={{ "--d": "300ms" } as React.CSSProperties}>{lead}</p>
      </div>
      {/* Kondisioner barmaqlığını xatırladan incə xətlər, sola doğru solur */}
      <div className="pointer-events-none absolute inset-y-0 right-0 hidden w-1/2 bg-[repeating-linear-gradient(0deg,rgba(255,255,255,0.05)_0_2px,transparent_2px_18px)] [mask-image:linear-gradient(90deg,transparent,#000)] lg:block" aria-hidden="true" />
    </section>
  );
}
