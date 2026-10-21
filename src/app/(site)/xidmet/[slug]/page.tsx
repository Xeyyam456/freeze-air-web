import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense, type ReactNode } from "react";
import { ArrowRight, ArrowUpRight, CircleCheck, Lightbulb, Phone } from "lucide-react";
import { ServiceIcon } from "@/components/landing/icons";
import { PageIntro } from "@/components/landing/PageIntro";
import { Reveal } from "@/components/landing/Reveal";
import { Spotlight } from "@/components/landing/Spotlight";
import { WhatsAppIcon } from "@/components/landing/WhatsAppIcon";
import { getServices } from "@/lib/site-content";
import { getContact, telHref, whatsappHref } from "@/lib/site-settings";
import { getTexts } from "@/lib/site-texts";

// Hər xidmətin məlumat səhifəsi (məzmun bazadan: admin panelində "Sayt" → Xidmətlər → redaktə)
export async function generateStaticParams() {
  const services = await getServices();
  return services.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: PageProps<"/xidmet/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const [services, t] = await Promise.all([getServices(), getTexts()]);
  const s = services.find((x) => x.slug === slug);
  return { title: s ? `${s.title} — ${t["brand.name"]}` : t["brand.name"], description: s?.lead || s?.text };
}

// params Suspense daxilində oxunur (Next 16: səhifənin qalanı dərhal göstərilsin)
export default function ServicePage({ params }: PageProps<"/xidmet/[slug]">) {
  return (
    <Suspense fallback={<div className="site-wrap py-20 text-night/50">Yüklənir...</div>}>
      {params.then(({ slug }) => <ServiceContent slug={slug} />)}
    </Suspense>
  );
}

async function ServiceContent({ slug }: { slug: string }) {
  const [services, t, contact] = await Promise.all([getServices(), getTexts(), getContact()]);
  const service = services.find((s) => s.slug === slug);
  if (!service) notFound();

  const others = services.filter((s) => s.id !== service.id);
  const paragraphs = service.details.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);
  const tel = telHref(contact.phone);
  const wa = whatsappHref(contact.phone);

  return (
    <>
      <PageIntro title={service.title} lead={service.lead || service.text} parent={{ href: "/xidmetler", label: t["nav.services"] }} />

      <section className="site-wrap grid items-start gap-4 lg:grid-cols-[1.6fr_1fr]">
        {/* Sol: məzmun */}
        <div className="grid gap-4">
          {service.image_url && (
            <Reveal className="reveal-wipe"><div className="overflow-hidden rounded-[32px] bg-white">
              {/* eslint-disable-next-line @next/next/no-img-element -- storage şəkli */}
              <img src={service.image_url} alt={service.title} className="block h-auto w-full" />
            </div></Reveal>
          )}

          {(paragraphs.length > 0 || service.text) && (
            <div className="flex gap-6 rounded-[28px] bg-white p-7 sm:p-9">
              <span className="hidden h-16 w-16 shrink-0 place-items-center rounded-2xl bg-glacier text-cold sm:grid"><ServiceIcon name={service.icon} size={30} /></span>
              <div className="space-y-4 text-lg leading-relaxed text-night/75">
                {(paragraphs.length > 0 ? paragraphs : [service.text]).map((p) => <p key={p}>{p}</p>)}
              </div>
            </div>
          )}

          {service.includes.length > 0 && (
            <div className="rounded-[28px] bg-white p-7 sm:p-9">
              <h2 className="font-display text-2xl font-bold">{t["service.includes"]}</h2>
              {/* Bənd sayı tək olanda son bənd iki sütunu tutur (sağda boş xana qalmasın) */}
              <ul className="mt-6 grid gap-x-8 gap-y-4 sm:grid-cols-2 sm:[&>li:last-child:nth-child(odd)]:col-span-2">
                {service.includes.map((item) => (
                  <li key={item} className="flex items-start gap-3 border-b border-night/5 pb-4 font-medium">
                    <CircleCheck size={20} className="mt-0.5 shrink-0 text-cold" /> <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Addımlar ardıcıllıqdır: nömrələnir, aralarında xətt; tünd aurora fonda */}
          {service.steps.length > 0 && (
            <div className="aurora relative overflow-hidden rounded-[28px] bg-night p-7 text-white sm:p-9">
              <h2 className="font-display text-2xl font-bold">{t["service.steps"]}</h2>
              <ol className="relative mt-8 grid gap-6 sm:grid-cols-2 xl:grid-flow-col xl:auto-cols-fr xl:grid-cols-none">
                <span className="absolute left-5 right-5 top-5 hidden h-0.5 bg-gradient-to-r from-cold via-ice/40 to-cold xl:block" aria-hidden="true" />
                {service.steps.map((step, i) => (
                  // Mobildə nömrə mətnin solunda (üstündə çox yer tuturdu)
                  <li key={step} className="relative max-sm:flex max-sm:items-center max-sm:gap-4">
                    <span className="relative z-10 grid h-10 w-10 shrink-0 place-items-center rounded-full bg-cold font-display text-sm font-bold">{i + 1}</span>
                    <p className="mt-4 font-semibold text-white/90 max-sm:mt-0">{step}</p>
                  </li>
                ))}
              </ol>
            </div>
          )}
        </div>

        {/* Sağ: yapışan çağırış bloku və məsləhət */}
        <aside className="grid gap-4 lg:sticky lg:top-20">
          {/* Çağırış kartı: tünd aurora fon + fırlanan işıqlı haşiyə (ana səhifənin əlaqə kartı ilə eyni dil) */}
          {/* Başlıq (kiçik ikon + mətn), iki şüşə "əlaqə plitəsi" (zəng: etiket + nömrə; WhatsApp: etiket + "Bizə yazın"),
              altda yanıb-sönən nöqtə ilə iş saatları. Plitələr ≥ 1024 və mobildə alt-alta, planşetdə yan-yana (kart tam endədir).
              640–767-də yan-yana plitədə nömrə 12px-ə düşürdü → orada da alt-alta.
              Bəyənilmədi: iri ayrıca nömrə + yumru düymələr ("kobud"); planşetdə məzmun solda (sağ yarı boş), iki sütun, hər şey mərkəzdə. */}
          <div className="glow-border aurora relative overflow-hidden rounded-[32px] bg-night p-7 text-white max-sm:p-5">
            <ServiceIcon name={service.icon} size={220} strokeWidth={1} className="pointer-events-none absolute -bottom-12 -right-12 text-cold/10" aria-hidden="true" />
            <div className="relative">
              <div className="flex items-center gap-4">
                <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-cold/15 text-cold ring-1 ring-cold/30"><ServiceIcon name={service.icon} size={22} /></span>
                <div className="min-w-0">
                  <h2 className="font-display text-xl font-bold leading-tight">{t["service.aside_title"]}</h2>
                  <p className="mt-1 text-sm text-white/65">{t["service.aside_text"]}</p>
                </div>
              </div>
              <div className="mt-6 grid gap-3 md:max-lg:grid-cols-2">
                {tel && (
                  <ContactTile href={tel} label={t["contact.call_label"]} value={contact.phone} icon={<Phone size={20} />} iconClass="bg-cold" />
                )}
                {wa && (
                  <ContactTile href={wa} external label={t["contact.whatsapp"]} value={t["services.cta_button"]} icon={<WhatsAppIcon size={21} />} iconClass="bg-[#25D366]" />
                )}
              </div>
              <p className="mt-5 flex items-center gap-2.5 border-t border-white/10 pt-4 text-sm text-white/60">
                <span className="relative flex h-2 w-2 shrink-0">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#25D366] opacity-60" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-[#25D366]" />
                </span>
                {contact.hours}
              </p>
            </div>
          </div>

          {service.note && (
            <div className="flex gap-4 rounded-[28px] bg-ice p-6 text-night">
              <Lightbulb size={24} className="mt-0.5 shrink-0 text-cold" />
              <p className="font-medium leading-relaxed">{service.note}</p>
            </div>
          )}
        </aside>
      </section>

      {/* Digər xidmətlər */}
      {others.length > 0 && (
        <section className="site-wrap mt-14">
          <h2 className="font-display text-2xl font-bold max-sm:text-center sm:text-3xl">{t["service.others"]}</h2>
          {/* Kart sayı sütun sayına bölünməyəndə natamam son sıra bütün eni tutur (flex-grow): 5 xidmət → 3 + 2 yarı-yarı, planşetdə 2+2+1 (sonuncu tam en).
              Son sıranı mərkəzdə saxlamaq (sabit en) sınandı — kartlar ortada tək qalırdı, bəyənilmədi.
              Kartda ad bir sətirdə (şrift enə görə), izah həmişə 2 sətir yer tutur, "Ətraflı" altda — qonşu kartlarla bir xətdə */}
          <div className="mt-6 flex flex-wrap gap-4">
            {others.map((o) => {
              return (
                // 640–767 bir sütun (iki sütunda ad 13px-ə düşürdü), ≥ 768 iki, ≥ 1024 üç
                <Spotlight key={o.id} className="w-full rounded-[24px] md:w-auto md:grow md:basis-[calc((100%-1rem)/2)] lg:basis-[calc((100%-2rem)/3)]">
                <Link href={`/xidmet/${o.slug}`}
                  className="group flex h-full items-start gap-4 rounded-[24px] bg-white p-6 transition-[box-shadow,transform] duration-300 hover:-translate-y-1 hover:shadow-[0_20px_44px_rgba(6,25,43,0.12)] max-sm:gap-3 max-sm:p-5">
                  <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-glacier text-cold transition-colors group-hover:bg-cold group-hover:text-white max-sm:h-10 max-sm:w-10 max-sm:rounded-xl">
                    <ServiceIcon name={o.icon} size={22} />
                  </span>
                  <span className="@container flex min-w-0 flex-1 flex-col self-stretch">
                    <span className="block font-display text-[min(1rem,calc(100cqi/13.6))] font-bold">{o.title}</span>
                    {o.text && <span className="mt-1 line-clamp-2 min-h-[2lh] text-sm text-night/60">{o.text}</span>}
                    <span className="mt-auto inline-flex items-center gap-1 pt-3 text-sm font-bold text-cold">
                      {t["service.more"]} <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
                    </span>
                  </span>
                </Link>
                </Spotlight>
              );
            })}
          </div>
        </section>
      )}

    </>
  );
}

// Çağırış kartındakı şüşə plitə: rəngli ikon, kiçik etiket, dəyər (bir sətirdə, şrift plitənin eninə görə), hover-də fırlanan ox
function ContactTile({ href, external, label, value, icon, iconClass }: {
  href: string;
  external?: boolean;
  label: string;
  value: string;
  icon: ReactNode;
  iconClass: string;
}) {
  return (
    <a href={href} {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      className="group/tile flex items-center gap-4 rounded-2xl bg-white/[0.06] p-4 ring-1 ring-white/10 backdrop-blur-sm transition-all duration-300 hover:-translate-y-0.5 hover:bg-white/10 hover:ring-cold/50 max-sm:gap-3">
      <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl text-white shadow-lg ${iconClass}`}>{icon}</span>
      <span className="@container min-w-0 flex-1">
        <span className="block text-xs font-semibold uppercase tracking-wider text-white/50">{label}</span>
        {/* 11.6 ≈ nömrənin eni / şrift ölçüsü (+ ehtiyat) */}
        <span className="mt-0.5 block whitespace-nowrap font-display text-[min(1.125rem,calc(100cqi/11.6))] font-bold">{value}</span>
      </span>
      {/* Mobildə ox gizli: dar plitədə nömrəyə yer qalsın */}
      <ArrowUpRight size={18} className="shrink-0 text-white/40 transition-all duration-300 group-hover/tile:rotate-45 group-hover/tile:text-white max-sm:hidden" />
    </a>
  );
}
