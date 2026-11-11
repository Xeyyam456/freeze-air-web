import type { ContactCardsProps } from "@/types/site";
import { Clock, Mail, MapPin, Phone } from "lucide-react";
import { ContactForm } from "@/components/landing/ContactForm";
import { tone } from "@/components/landing/tones";
import { Reveal } from "@/components/landing/Reveal";
import { WhatsAppIcon } from "@/components/landing/WhatsAppIcon";
import { getContact } from "@/services/site/fetchSiteSettings.server";
import { telHref, whatsappHref } from "@/shared/utils/phone";
import { ContactMap } from "./ContactMap";

// Əlaqə: solda tünd aurora panel (telefon + düymələr, altında ünvan / iş saatı / e-poçt sətirləri),
// sağda "Bizə yazın" forması, aşağıda tam enli xəritə. Məlumatlar bazadan (admin → Sayt → Əlaqə).
export async function ContactCards({ t }: ContactCardsProps) {
  const c = await getContact();
  const tel = telHref(c.phone);
  const wa = whatsappHref(c.phone);
  const rows = [
    { icon: MapPin, label: t["contact.address"], value: c.address, href: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(c.address)}` },
    { icon: Clock, label: t["contact.hours"], value: c.hours },
    ...(c.email ? [{ icon: Mail, label: t["contact.email"], value: c.email, href: `mailto:${c.email}` }] : []),
  ];

  return (
    <div className="bg-[radial-gradient(42%_30%_at_4%_12%,rgba(0,163,217,0.14),transparent),radial-gradient(38%_28%_at_98%_30%,rgba(255,159,28,0.12),transparent),radial-gradient(40%_30%_at_10%_92%,rgba(31,111,235,0.1),transparent)] pb-1">
      {/* minmax(0,…): sütunlar məzmuna görə genişlənməsin (nömrə sətri mobildə səhifəni daşırırdı, 1024-də formanı sıxırdı) */}
      <section className="site-wrap grid grid-cols-[minmax(0,1fr)] items-stretch gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
        <Reveal className="h-full">
          <div className="@container glow-border aurora relative flex h-full flex-col overflow-hidden rounded-[32px] bg-night bg-[radial-gradient(60%_40%_at_100%_100%,rgba(255,159,28,0.14),transparent)] p-8 text-white max-sm:p-6 sm:p-10">
            <Phone size={240} strokeWidth={0.8} className="pointer-events-none absolute -right-10 -top-10 text-cold/10" aria-hidden="true" />
            <p className="relative font-semibold text-white/60">{t["contact.call_label"]}</p>
            {/* Nömrə bir sətirdə: şrift panelin eninə görə (11.2 ≈ nömrənin eni / şrift ölçüsü + ehtiyat) */}
            <p className="relative mt-2 whitespace-nowrap bg-gradient-to-r from-white via-white to-[#7fdcff] bg-clip-text font-display text-transparent text-[min(1.875rem,calc(100cqi/11.2))] font-bold tracking-tight sm:text-[min(2.75rem,calc(100cqi/11.2))]">{c.phone}</p>
            {/* İki düymə panelin enini yarı-yarı bölür (solda dayananda sağda 180–600px boş qalırdı); < 400px alt-alta */}
            <div className="relative mt-7 grid grid-cols-2 gap-3 max-[400px]:grid-cols-1 [&>a:only-child]:col-span-2 [&>a]:justify-center">
              {tel && (
                <a href={tel} className="inline-flex h-12 items-center gap-2 rounded-full bg-gradient-to-r from-cold to-primary px-6 font-bold text-white shadow-[0_12px_28px_rgba(0,163,217,0.4)] transition-all hover:-translate-y-px hover:shadow-[0_16px_34px_rgba(31,111,235,0.5)]">
                  <Phone size={18} /> {t["contact.call"]}
                </a>
              )}
              {wa && (
                <a href={wa} target="_blank" rel="noopener noreferrer"
                  className="inline-flex h-12 items-center gap-2 rounded-full bg-[#25D366] px-6 font-bold text-white transition-all hover:-translate-y-px hover:bg-[#1DA851]">
                  <WhatsAppIcon size={19} /> {t["contact.whatsapp"]}
                </a>
              )}
            </div>

            {/* Ünvan, iş saatı, e-poçt: ikonlu sətirlər, aralarında incə xətt; mobildə dəyər iki sətrə keçə bilər (ünvan kəsilirdi) */}
            <ul className="relative mt-auto divide-y divide-white/10 pt-10">
              {rows.map(({ icon: Icon, label, value, href }, i) => (
                <li key={label} style={tone(i)} className="flex items-center gap-4 py-4">
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-[linear-gradient(135deg,var(--tone),color-mix(in_srgb,var(--tone)_55%,#06192b))] text-white shadow-[0_8px_20px_color-mix(in_srgb,var(--tone)_45%,transparent)] ring-1 ring-white/20"><Icon size={19} /></span>
                  <span className="min-w-0">
                    <span className="block text-xs text-white/50">{label}</span>
                    {href
                      ? <a href={href} {...(href.startsWith("http") ? { target: "_blank", rel: "noopener noreferrer" } : {})} className="block truncate font-semibold transition-colors hover:text-(--tone) max-sm:whitespace-normal">{value}</a>
                      : <span className="block truncate font-semibold max-sm:whitespace-normal">{value}</span>}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </Reveal>

        <Reveal delay={120} className="h-full">
          <ContactForm t={t} />
        </Reveal>
      </section>

      {/* Xəritə: tam en, ortada döyünən ünvan nişanı (ünvan yazısı istifadəçi istəyi ilə yoxdur);
          "Marşrut qur" (istifadəçinin yerindən ünvana yol) və "Ünvana qayıt" (components/landing/ContactMap.tsx) */}
      <section className="site-wrap mt-5">
        <Reveal>
          <ContactMap address={c.address} title={`Xəritə: ${c.address}`} texts={{
            reset: t["contact.map_reset"], route: t["contact.route"], routeLoading: t["contact.route_loading"],
            routeDenied: t["contact.route_denied"], routeOpen: t["contact.route_open"], waze: t["contact.waze"],
          }} />
        </Reveal>
      </section>
    </div>
  );
}
