import type { Metadata } from "next";
import { Suspense } from "react";
import { Clock, Mail, MapPin, Phone } from "lucide-react";
import { ContactForm } from "@/components/landing/ContactForm";
import { ContactMap } from "@/components/landing/ContactMap";
import { PageIntro } from "@/components/landing/PageIntro";
import { Reveal } from "@/components/landing/Reveal";
import { WhatsAppIcon } from "@/components/landing/WhatsAppIcon";
import { getContact, telHref, whatsappHref } from "@/lib/site-settings";
import { getTexts, pageTitle, type Texts } from "@/lib/site-texts";

export async function generateMetadata(): Promise<Metadata> {
  return { title: await pageTitle("contact.title") };
}

// Əlaqə: solda tünd aurora panel (telefon + düymələr, altında ünvan / iş saatı / e-poçt sətirləri),
// sağda "Bizə yazın" forması, aşağıda tam enli xəritə. Məlumatlar bazadan (admin → Sayt → Əlaqə).
async function ContactCards({ t }: { t: Texts }) {
  const c = await getContact();
  const tel = telHref(c.phone);
  const wa = whatsappHref(c.phone);
  const rows = [
    { icon: MapPin, label: t["contact.address"], value: c.address, href: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(c.address)}` },
    { icon: Clock, label: t["contact.hours"], value: c.hours },
    ...(c.email ? [{ icon: Mail, label: t["contact.email"], value: c.email, href: `mailto:${c.email}` }] : []),
  ];

  return (
    <>
      <section className="site-wrap grid items-stretch gap-5 lg:grid-cols-[1fr_1.1fr]">
        <Reveal className="h-full">
          <div className="glow-border aurora relative flex h-full flex-col overflow-hidden rounded-[32px] bg-night p-8 text-white sm:p-10">
            <Phone size={240} strokeWidth={0.8} className="pointer-events-none absolute -right-10 -top-10 text-cold/10" aria-hidden="true" />
            <p className="relative font-semibold text-white/60">{t["contact.call_label"]}</p>
            <p className="relative mt-2 whitespace-nowrap font-display text-3xl font-bold tracking-tight sm:text-[44px]">{c.phone}</p>
            <div className="relative mt-7 flex flex-wrap gap-3">
              {tel && (
                <a href={tel} className="inline-flex h-12 items-center gap-2 rounded-full bg-cold px-6 font-bold text-white transition-all hover:-translate-y-px hover:bg-white hover:text-night">
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

            {/* Ünvan, iş saatı, e-poçt: ikonlu sətirlər, aralarında incə xətt */}
            <ul className="relative mt-auto divide-y divide-white/10 pt-10">
              {rows.map(({ icon: Icon, label, value, href }) => (
                <li key={label} className="flex items-center gap-4 py-4">
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-cold/15 text-cold ring-1 ring-cold/30"><Icon size={19} /></span>
                  <span className="min-w-0">
                    <span className="block text-xs text-white/50">{label}</span>
                    {href
                      ? <a href={href} {...(href.startsWith("http") ? { target: "_blank", rel: "noopener noreferrer" } : {})} className="block truncate font-semibold transition-colors hover:text-cold">{value}</a>
                      : <span className="block truncate font-semibold">{value}</span>}
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
            routeDenied: t["contact.route_denied"], routeOpen: t["contact.route_open"],
          }} />
        </Reveal>
      </section>
    </>
  );
}

export default async function ContactPage() {
  const t = await getTexts();
  return (
    <>
      <PageIntro title={t["contact.title"]} lead={t["contact.lead"]} />
      <Suspense fallback={<div className="site-wrap"><div className="h-[520px] rounded-[32px] bg-white/60" /></div>}>
        <ContactCards t={t} />
      </Suspense>
    </>
  );
}
