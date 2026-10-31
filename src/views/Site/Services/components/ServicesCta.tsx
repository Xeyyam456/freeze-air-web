import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Reveal } from "@/components/landing/Reveal";
import type { TextsProps } from "@/types/site";

// Çağırış: tünd aurora kart, fırlanan işıqlı haşiyə. Planşetdə düymə sağda (bir sırada), mobildə mətnin altında tam endə
export function ServicesCta({ t }: TextsProps) {
  return (
    <Reveal className="mt-6">
      <div className="glow-border aurora relative flex flex-wrap items-center justify-between gap-6 overflow-hidden rounded-[32px] bg-night px-10 py-10 text-white max-sm:px-6 max-sm:py-8 sm:max-lg:flex-nowrap">
        <p className="max-w-2xl text-balance font-display text-2xl font-bold leading-snug max-sm:w-full max-sm:text-center max-sm:text-xl sm:max-lg:min-w-0 sm:max-lg:text-xl">{t["services.cta_text"]}</p>
        <Link href="/elaqe" className="inline-flex h-12 shrink-0 items-center justify-center gap-2 rounded-full bg-cold px-7 font-bold transition-all hover:-translate-y-px hover:bg-white hover:text-night max-sm:w-full">
          {t["services.cta_button"]} <ArrowRight size={18} />
        </Link>
      </div>
    </Reveal>
  );
}
