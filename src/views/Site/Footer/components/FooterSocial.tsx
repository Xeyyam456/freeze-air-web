import { FacebookIcon, InstagramIcon } from "@/components/landing/SocialIcons";
import { WhatsAppIcon } from "@/components/landing/WhatsAppIcon";
import { getContact, whatsappHref } from "@/lib/site-settings";
import type { FooterSocialProps } from "@/types/site";

// Sosial düymələr: yalnız doldurulanlar görünür (WhatsApp telefon mobil formatdadırsa)
export async function FooterSocial({ title }: FooterSocialProps) {
  const c = await getContact();
  const links = [
    { href: whatsappHref(c.phone), label: "WhatsApp", icon: <WhatsAppIcon size={18} /> },
    { href: c.instagram ?? undefined, label: "Instagram", icon: <InstagramIcon size={18} /> },
    { href: c.facebook ?? undefined, label: "Facebook", icon: <FacebookIcon size={18} /> },
  ].filter((l) => l.href);
  if (links.length === 0) return null;
  return (
    <div className="mt-8 max-lg:mt-0">
      <p className="text-sm font-bold text-white/80 max-lg:sr-only">{title}</p>
      <ul className="mt-3 flex gap-2.5 max-lg:mt-0">
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
