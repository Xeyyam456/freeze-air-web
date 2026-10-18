import Link from "next/link";
import { Clock, LogIn, Mail, MapPin, Phone, Snowflake } from "lucide-react";
import { Suspense } from "react";
import { getContact, getLogo, telHref, whatsappHref } from "@/lib/site-settings";
import { getServices } from "@/lib/site-content";
import { getTexts } from "@/lib/site-texts";
import { sitePages } from "./content";
import { FacebookIcon, InstagramIcon } from "./SocialIcons";
import { WhatsAppIcon } from "./WhatsAppIcon";

// Əlaqə sətirləri klik olunur: zəng, xəritə, e-poçt (saatlar yalnız məlumatdır)
const contactLink = "flex gap-3 transition-colors hover:text-cold";

async function FooterContact() {
  const c = await getContact();
  const tel = telHref(c.phone);
  const map = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(c.address)}`;
  return (
    <>
      <li>{tel
        ? <a href={tel} className={contactLink}><Phone size={18} className="mt-0.5 shrink-0 text-cold" /> {c.phone}</a>
        : <span className="flex gap-3"><Phone size={18} className="mt-0.5 shrink-0 text-cold" /> {c.phone}</span>}</li>
      <li><a href={map} target="_blank" rel="noopener noreferrer" className={contactLink}><MapPin size={18} className="mt-0.5 shrink-0 text-cold" /> {c.address}</a></li>
      <li className="flex gap-3"><Clock size={18} className="mt-0.5 shrink-0 text-cold" /> {c.hours}</li>
      {c.email && <li><a href={`mailto:${c.email}`} className={contactLink}><Mail size={18} className="mt-0.5 shrink-0 text-cold" /> {c.email}</a></li>}
    </>
  );
}

// Sosial düymələr: yalnız doldurulanlar görünür (WhatsApp telefon mobil formatdadırsa)
async function FooterSocial({ title }: { title: string }) {
  const c = await getContact();
  const links = [
    { href: whatsappHref(c.phone), label: "WhatsApp", icon: <WhatsAppIcon size={18} /> },
    { href: c.instagram ?? undefined, label: "Instagram", icon: <InstagramIcon size={18} /> },
    { href: c.facebook ?? undefined, label: "Facebook", icon: <FacebookIcon size={18} /> },
  ].filter((l) => l.href);
  if (links.length === 0) return null;
  return (
    <div className="mt-8">
      <p className="text-sm font-bold text-white/80">{title}</p>
      <ul className="mt-3 flex gap-2.5">
        {links.map((l) => (
          <li key={l.label}>
            <a href={l.href} target="_blank" rel="noopener noreferrer" aria-label={l.label} title={l.label}
              className="grid h-11 w-11 place-items-center rounded-full border border-white/15 text-white/75 transition-all hover:-translate-y-0.5 hover:border-cold hover:bg-cold hover:text-white">
              {l.icon}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

// Footer-dəki xidmət keçidləri (bazadan, bütün aktiv xidmətlər)
async function FooterServices() {
  const services = await getServices();
  return services.map((s) => (
    <li key={s.id}><Link href={`/xidmet/${s.slug}`} className="text-white/65 transition-colors hover:text-cold">{s.title}</Link></li>
  ));
}

// Footer: tünd blok, yuxarıda istidən soyuğa şkala; 4 sütun və alt zolaq. Mətnlər bazadan.
export async function SiteFooter() {
  const [t, logo] = await Promise.all([getTexts(), getLogo()]);
  return (
    <footer className="mt-20 bg-night text-white">
      <div className="h-1.5 w-full bg-gradient-to-r from-heat via-ice to-cold" aria-hidden="true" />

      <div className="site-wrap relative grid gap-10 overflow-hidden py-16 sm:grid-cols-2 lg:grid-cols-[1.3fr_1fr_1fr_1fr]">
        <div>
          <Link href="/" className="flex items-center gap-3">
            {logo
              // Tünd fonda: loqo ağ kartın içində, rəngli loqo da görünsün
              // eslint-disable-next-line @next/next/no-img-element -- storage şəkli
              ? <span className="grid h-11 place-items-center rounded-2xl bg-white px-2"><img src={logo} alt={t["brand.name"]} className="h-8 w-auto max-w-[140px] object-contain" /></span>
              : (
                <span className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-cold to-[#0b3a5c]">
                  <Snowflake size={22} strokeWidth={2.2} />
                </span>
              )}
            <span className="font-display text-lg font-bold">{t["brand.name"]}</span>
          </Link>
          <p className="mt-5 max-w-xs text-white/55">{t["footer.text"]}</p>
          <Link href="/login" className="mt-6 inline-flex h-10 items-center gap-2 rounded-full border border-white/20 px-4 text-sm font-bold text-white/80 transition-colors hover:border-white hover:text-white">
            <LogIn size={15} /> {t["footer.login"]}
          </Link>
          <Suspense fallback={null}>
            <FooterSocial title={t["footer.social"]} />
          </Suspense>
        </div>

        <div>
          <p className="font-display text-sm font-bold">{t["footer.pages"]}</p>
          <ul className="mt-5 space-y-3">
            {sitePages(t).map((p) => (
              <li key={p.href}><Link href={p.href} className="text-white/65 transition-colors hover:text-cold">{p.label}</Link></li>
            ))}
          </ul>
        </div>

        <div>
          <p className="font-display text-sm font-bold">{t["footer.services"]}</p>
          <ul className="mt-5 space-y-3">
            <Suspense fallback={null}>
              <FooterServices />
            </Suspense>
          </ul>
        </div>

        <div>
          <p className="font-display text-sm font-bold">{t["footer.contact"]}</p>
          <ul className="mt-5 space-y-4 text-white/65">
            <Suspense fallback={null}>
              <FooterContact />
            </Suspense>
          </ul>
        </div>

        <Snowflake size={380} strokeWidth={0.5} className="pointer-events-none absolute -bottom-40 -right-20 text-white/[0.04]" aria-hidden="true" />
      </div>

      <div className="border-t border-white/10">
        <div className="site-wrap flex flex-wrap items-center justify-between gap-3 py-5 text-sm text-white/45">
          <span>{t["footer.copyright"]}</span>
          <span>{t["footer.slogan"]}</span>
        </div>
      </div>
    </footer>
  );
}
