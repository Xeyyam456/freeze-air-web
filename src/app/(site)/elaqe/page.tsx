import type { Metadata } from "next";
import { Suspense } from "react";
import { Clock, Mail, MapPin, Phone } from "lucide-react";
import { ContactForm } from "@/components/landing/ContactForm";
import { PageIntro } from "@/components/landing/PageIntro";
import { WhatsAppIcon } from "@/components/landing/WhatsAppIcon";
import { getContact, telHref, whatsappHref } from "@/lib/site-settings";
import { getTexts, pageTitle, type Texts } from "@/lib/site-texts";

export async function generateMetadata(): Promise<Metadata> {
  return { title: await pageTitle("contact.title") };
}

// Məlumatlar bazadan (admin panelində "Sayt")
async function ContactCards({ t }: { t: Texts }) {
  const c = await getContact();
  const tel = telHref(c.phone);
  const wa = whatsappHref(c.phone);
  const mapUrl = `https://www.google.com/maps?q=${encodeURIComponent(c.address)}&z=14&output=embed`;

  return (
    <>
      <section className="site-wrap grid gap-4 lg:grid-cols-[1.5fr_1fr]">
        {/* Telefon bloku: ikon, nömrə və iki düymə; arxa fonda iri dəstək ikonu */}
        <div className="relative flex flex-col justify-center overflow-hidden rounded-[32px] bg-gradient-to-br from-cold to-[#0077b6] p-8 text-white sm:p-10">
          <Phone size={260} strokeWidth={1} className="pointer-events-none absolute -bottom-12 -right-10 text-white/10" aria-hidden="true" />
          <div className="relative">
            <span className="grid h-14 w-14 place-items-center rounded-2xl bg-white/15"><Phone size={26} /></span>
            <p className="mt-6 font-semibold text-white/75">{t["contact.call_label"]}</p>
            <p className="mt-1 whitespace-nowrap font-display text-3xl font-bold tracking-tight sm:text-[44px]">{c.phone}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              {tel && (
                <a href={tel} className="inline-flex h-12 items-center gap-2 rounded-full bg-white px-6 font-bold text-night transition-colors hover:bg-night hover:text-white">
                  <Phone size={18} /> {t["contact.call"]}
                </a>
              )}
              {wa && (
                <a href={wa} target="_blank" rel="noopener noreferrer"
                  className="inline-flex h-12 items-center gap-2 rounded-full bg-[#25D366] px-6 font-bold text-white shadow-[0_8px_20px_rgba(18,140,126,0.35)] transition-colors hover:bg-[#1DA851]">
                  <WhatsAppIcon size={19} /> {t["contact.whatsapp"]}
                </a>
              )}
            </div>
          </div>
        </div>
        <div className="grid gap-4">
          <div className="rounded-[28px] bg-white p-7">
            <span className="flex items-center gap-2 text-sm font-semibold text-night/55"><MapPin size={16} /> {t["contact.address"]}</span>
            <p className="mt-3 text-xl font-bold">{c.address}</p>
          </div>
          <div className="rounded-[28px] bg-white p-7">
            <span className="flex items-center gap-2 text-sm font-semibold text-night/55"><Clock size={16} /> {t["contact.hours"]}</span>
            <p className="mt-3 text-xl font-bold">{c.hours}</p>
          </div>
          {c.email && (
            <div className="rounded-[28px] bg-white p-7">
              <span className="flex items-center gap-2 text-sm font-semibold text-night/55"><Mail size={16} /> {t["contact.email"]}</span>
              <a href={`mailto:${c.email}`} className="mt-3 block text-xl font-bold hover:text-cold">{c.email}</a>
            </div>
          )}
        </div>
      </section>
      <section className="site-wrap mt-4 grid gap-4 lg:grid-cols-[1fr_1fr]">
        <ContactForm t={t} />
        <div className="min-h-[420px] overflow-hidden rounded-[28px] bg-white">
          <iframe src={mapUrl} title={`Xəritə: ${c.address}`} className="h-full min-h-[420px] w-full" loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
        </div>
      </section>
    </>
  );
}

export default async function ContactPage() {
  const t = await getTexts();
  return (
    <>
      <PageIntro title={t["contact.title"]} lead={t["contact.lead"]} />
      <Suspense fallback={<div className="site-wrap"><div className="h-[280px] rounded-[32px] bg-cold/40" /></div>}>
        <ContactCards t={t} />
      </Suspense>
    </>
  );
}
