import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { ContactCardProps } from "@/types/site";

// Əsas çağırış kartı: tünd aurora fon + fırlanan işıqlı haşiyə (.glow-border).
// Planşetdə kart tam endədir: iki bərabər yarı — solda başlıq, mətn və düymə; sağda məlumatlar şüşə plitələrdə
export function ContactCard({ t, items }: ContactCardProps) {
  return (
    <div className="glow-border aurora relative overflow-hidden rounded-[28px] bg-night p-8 text-white sm:p-10 sm:max-lg:grid sm:max-lg:grid-cols-2 sm:max-lg:gap-x-8">
      <div className="sm:max-lg:self-end">
        <p className="font-semibold text-cold">{t["home.contact.label"]}</p>
        <h2 className="mt-2 font-display text-3xl font-bold">{t["home.contact.title"]}</h2>
        <p className="mt-3 text-white/60">{t["home.contact.text"]}</p>
      </div>
      <ul className="mt-8 space-y-5 sm:max-lg:col-start-2 sm:max-lg:row-span-2 sm:max-lg:row-start-1 sm:max-lg:mt-0 sm:max-lg:space-y-3 sm:max-lg:self-center">
        {items.map(({ icon: Icon, label, value, href }) => (
          <li key={label} className="flex items-center gap-4 sm:max-lg:rounded-2xl sm:max-lg:bg-white/[0.06] sm:max-lg:p-3 sm:max-lg:ring-1 sm:max-lg:ring-white/10">
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-white/10 text-cold"><Icon size={20} /></span>
            <span>
              <span className="block text-xs text-white/50">{label}</span>
              {href ? <a href={href} className="font-semibold hover:text-cold">{value}</a> : <span className="font-semibold">{value}</span>}
            </span>
          </li>
        ))}
      </ul>
      <Link href="/elaqe" className="mt-8 inline-flex h-12 items-center gap-2 rounded-full bg-cold px-6 font-bold transition-colors hover:bg-white hover:text-night max-sm:w-full max-sm:justify-center sm:max-lg:col-start-1 sm:max-lg:row-start-2 sm:max-lg:mt-6 sm:max-lg:self-start sm:max-lg:justify-self-start">
        {t["home.contact.button"]} <ArrowRight size={18} />
      </Link>
    </div>
  );
}
