import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Reveal } from "@/components/landing/Reveal";
import { getFaq } from "@/lib/site-trust";
import { SITE_URL } from "@/lib/site-url";
import type { TextsProps } from "@/types/site";
import { FaqItem } from "./FaqItem";

// Tez-tez verilən suallar: <details> (JS-siz işləyir), Google üçün FAQPage işarələməsi; siyahı boşdursa bölmə yoxdur
export async function FaqSection({ t }: TextsProps) {
  const faq = await getFaq();
  if (faq.length === 0) return null;
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    url: SITE_URL,
    mainEntity: faq.map((f) => ({ "@type": "Question", name: f.question, acceptedAnswer: { "@type": "Answer", text: f.answer } })),
  };
  return (
    // Tam en: yuxarıda başlıq (solda) və "Bizə yazın" (sağda), altında suallar bütün eni tutur; hamısı bağlı açılır
    // (istifadəçi: iki sütuna bölünmə, ortada dar sütun və açıq ilk sual bəyənilmədi)
    <section className="site-wrap py-20">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <Reveal>
        {/* Mobildə digər bölmələr kimi mərkəzdə: göy xətt, başlıq və alt mətn ortada, düymə altında tam endə */}
        <span className="block h-1 w-12 rounded-full bg-cold max-sm:mx-auto" aria-hidden="true" />
        {/* Düymə başlıq + alt mətn blokunun şaquli ortasında (göy xətt sıradan kənardadır) */}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-6 sm:flex-nowrap">
          <div className="min-w-0 max-sm:w-full max-sm:text-center">
            <h2 className="font-display text-[clamp(1.4rem,6.9vw,1.875rem)] font-bold leading-tight sm:text-4xl sm:max-md:text-[clamp(1.6rem,4.9vw,2.25rem)]">{t["home.faq.title"]}</h2>
            <p className="mt-3 text-night/60">{t["home.faq.lead"]}</p>
          </div>
          <Link href="/elaqe" className="inline-flex h-12 shrink-0 items-center max-sm:w-full max-sm:justify-center gap-2 rounded-full border border-night/15 px-6 font-bold transition-colors hover:border-night hover:bg-night hover:text-white">
            {t["home.faq.button"]} <ArrowRight size={18} />
          </Link>
        </div>
      </Reveal>
      <Reveal delay={120}>
        <div className="mt-10 space-y-3">
          {faq.map((f) => <FaqItem key={f.id} item={f} />)}
        </div>
      </Reveal>
    </section>
  );
}
