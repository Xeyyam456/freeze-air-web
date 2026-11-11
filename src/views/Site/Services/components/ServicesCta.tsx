import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Reveal } from "@/components/landing/Reveal";
import type { TextsProps } from "@/types/site";

// Çağırış: tünd aurora kart, fırlanan işıqlı haşiyə. Planşetdə düymə sağda (bir sırada), mobildə mətnin altında tam endə
export function ServicesCta({ t }: TextsProps) {
  return (
    <Reveal className="mt-6">
      <div className="glow-border aurora relative flex flex-wrap items-center justify-between gap-6 overflow-hidden rounded-[32px] bg-night bg-[radial-gradient(50%_80%_at_100%_100%,rgba(255,159,28,0.16),transparent)] px-10 py-10 text-white max-sm:px-6 max-sm:py-8 sm:max-lg:flex-nowrap">
        <p className="max-w-2xl text-balance font-display text-2xl font-bold leading-snug max-sm:w-full max-sm:text-center max-sm:text-xl sm:max-lg:min-w-0 sm:max-lg:text-xl">{t["services.cta_text"]}</p>
        <Link href="/elaqe" className="inline-flex h-12 shrink-0 items-center justify-center gap-2 rounded-full bg-gradient-to-r from-cold to-primary px-7 font-bold shadow-[0_12px_28px_rgba(0,163,217,0.4)] transition-all hover:-translate-y-px hover:shadow-[0_16px_34px_rgba(31,111,235,0.5)] max-sm:w-full">
          {t["services.cta_button"]} <ArrowRight size={18} />
        </Link>
      </div>
    </Reveal>
  );
}
