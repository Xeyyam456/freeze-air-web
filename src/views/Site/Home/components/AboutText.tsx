import Link from "next/link";
import { ArrowRight, CircleCheck } from "lucide-react";
import type { AboutTextProps } from "@/types/site";
import { tone } from "@/components/landing/tones";

export function AboutText({ about: a, t }: AboutTextProps) {
  return (
    <div>
      <p className="font-semibold text-cold">{t["home.about.label"]}</p>
      {/* Planşetdə mətn tam endədir: şrift enə görə kiçilir ki, başlıq bir sətrə sığsın */}
      <h2 className="mt-2 text-balance font-display text-[clamp(1.4rem,6.9vw,1.875rem)] font-bold leading-tight sm:text-4xl sm:max-lg:text-[clamp(1.6rem,4.3vw,2.25rem)]">{a.title}</h2>
      {a.text.map((p) => <p key={p} className="mt-4 text-night/65">{p}</p>)}
      {/* Planşetdə mətn tam endədir: siyahı solda, düymə sağda (siyahının alt xəttində); mobildə düymə siyahının altında, sağda */}
      <div className="max-sm:flex max-sm:flex-col max-sm:items-end sm:max-lg:flex sm:max-lg:items-end sm:max-lg:justify-between sm:max-lg:gap-6">
        {a.points.length > 0 && (
          <ul className="mt-6 space-y-3 max-sm:self-stretch">
            {a.points.map((p, i) => (
              <li key={p} style={tone(i)} className="flex items-center gap-3 font-semibold"><span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-[color-mix(in_srgb,var(--tone)_14%,white)] text-(--tone)"><CircleCheck size={18} /></span> {p}</li>
            ))}
          </ul>
        )}
        <Link href="/nece-isleyirik" className="mt-8 inline-flex h-12 shrink-0 items-center gap-2 rounded-full bg-gradient-to-r from-cold to-primary px-6 font-bold text-white shadow-[0_12px_28px_rgba(0,163,217,0.35)] transition-all hover:-translate-y-px hover:shadow-[0_16px_34px_rgba(31,111,235,0.4)] max-sm:w-full max-sm:justify-center sm:max-lg:mt-0">
          {t["home.about.button"]} <ArrowRight size={18} />
        </Link>
      </div>
    </div>
  );
}
