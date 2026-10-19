import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ArrowRight, CircleCheck, Lightbulb, Phone } from "lucide-react";
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
              <ul className="mt-6 grid gap-x-8 gap-y-4 sm:grid-cols-2">
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
                  <li key={step} className="relative">
                    <span className="relative z-10 grid h-10 w-10 place-items-center rounded-full bg-cold font-display text-sm font-bold">{i + 1}</span>
                    <p className="mt-4 font-semibold text-white/90">{step}</p>
                  </li>
                ))}
              </ol>
            </div>
          )}
        </div>

        {/* Sağ: yapışan çağırış bloku və məsləhət */}
        <aside className="grid gap-4 lg:sticky lg:top-20">
          {/* Çağırış kartı: tünd aurora fon + fırlanan işıqlı haşiyə (ana səhifənin əlaqə kartı ilə eyni dil) */}
          <div className="glow-border aurora relative overflow-hidden rounded-[32px] bg-night p-8 text-white">
            <ServiceIcon name={service.icon} size={220} strokeWidth={1} className="pointer-events-none absolute -bottom-12 -right-12 text-cold/10" aria-hidden="true" />
            <div className="relative">
              <span className="grid h-14 w-14 place-items-center rounded-2xl bg-cold/15 text-cold ring-1 ring-cold/30"><ServiceIcon name={service.icon} size={26} /></span>
              <h2 className="mt-6 font-display text-2xl font-bold">{t["service.aside_title"]}</h2>
              <p className="mt-2 text-white/80">{t["service.aside_text"]}</p>
              <p className="mt-6 whitespace-nowrap font-display text-2xl font-bold tracking-tight sm:text-3xl">{contact.phone}</p>
              <div className="mt-6 flex flex-wrap gap-3">
                {tel && (
                  <a href={tel} className="inline-flex h-12 items-center gap-2 rounded-full bg-cold px-6 font-bold text-white transition-colors hover:bg-white hover:text-night">
                    <Phone size={18} /> {t["contact.call"]}
                  </a>
                )}
                {wa && (
                  <a href={wa} target="_blank" rel="noopener noreferrer"
                    className="inline-flex h-12 items-center gap-2 rounded-full bg-[#25D366] px-6 font-bold text-white transition-colors hover:bg-[#1DA851]">
                    <WhatsAppIcon size={19} /> {t["contact.whatsapp"]}
                  </a>
                )}
              </div>
              <Link href="/elaqe" className="mt-5 inline-flex items-center gap-1.5 font-semibold text-white/85 underline-offset-4 hover:text-white hover:underline">
                {t["services.cta_button"]} <ArrowRight size={16} />
              </Link>
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
          <h2 className="font-display text-2xl font-bold sm:text-3xl">{t["service.others"]}</h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {others.map((o) => {
              return (
                <Spotlight key={o.id} className="rounded-[24px]">
                <Link href={`/xidmet/${o.slug}`}
                  className="group flex h-full items-start gap-4 rounded-[24px] bg-white p-6 transition-[box-shadow,transform] duration-300 hover:-translate-y-1 hover:shadow-[0_20px_44px_rgba(6,25,43,0.12)]">
                  <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-glacier text-cold transition-colors group-hover:bg-cold group-hover:text-white">
                    <ServiceIcon name={o.icon} size={22} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-display font-bold">{o.title}</span>
                    {o.text && <span className="mt-1 line-clamp-2 block text-sm text-night/60">{o.text}</span>}
                    <span className="mt-3 inline-flex items-center gap-1 text-sm font-bold text-cold">
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
