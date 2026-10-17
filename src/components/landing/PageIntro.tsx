import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { getTexts } from "@/lib/site-texts";

// Alt səhifələrin başlıq banneri: yol (Əsas / [valideyn] / Səhifə), böyük başlıq, bir cümləlik izah
export async function PageIntro({ title, lead, parent }: {
  title: string;
  lead: string;
  parent?: { href: string; label: string };
}) {
  const t = await getTexts();
  return (
    <section className="relative mb-14 overflow-hidden bg-gradient-to-r from-night via-[#0b3a5c] to-cold text-white">
      <div className="site-wrap relative py-16 sm:py-20">
        <nav className="flex items-center gap-1.5 text-sm text-white/60" aria-label="Yol">
          <Link href="/" className="hover:text-white">{t["nav.home"]}</Link>
          <ChevronRight size={14} />
          {parent && (
            <>
              <Link href={parent.href} className="hover:text-white">{parent.label}</Link>
              <ChevronRight size={14} />
            </>
          )}
          <span className="text-white">{title}</span>
        </nav>
        <h1 className="mt-4 font-display text-4xl font-bold leading-[1.05] sm:text-5xl">{title}</h1>
        <p className="mt-4 max-w-2xl text-lg text-white/70">{lead}</p>
      </div>
      {/* Kondisioner barmaqlığını xatırladan incə xətlər */}
      <div className="pointer-events-none absolute inset-y-0 right-0 hidden w-1/3 bg-[repeating-linear-gradient(0deg,rgba(255,255,255,0.06)_0_2px,transparent_2px_18px)] lg:block" aria-hidden="true" />
    </section>
  );
}
