import { Phone } from "lucide-react";
import { HeroQuickForm } from "@/components/landing/HeroQuickForm";
import { getContact, getHomeContent, telHref } from "@/lib/site-settings";
import type { TextsProps } from "@/types/site";

// Hero-dakı form altındakı yazı: qısa izah + telefon (bazadan)
async function HeroNote({ t }: TextsProps) {
  const c = await getContact();
  const tel = telHref(c.phone);
  return (
    <p className="mt-4 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-white/65">
      <span>{t["home.quick.note"]}</span>
      {tel && (
        <>
          <span className="text-white/30" aria-hidden="true">·</span>
          <span>{t["home.quick.or"]}:</span>
          <a href={tel} className="inline-flex items-center gap-1.5 font-bold text-white transition-colors hover:text-heat"><Phone size={14} /> {c.phone}</a>
        </>
      )}
    </p>
  );
}

// Sürətli müraciət formu: admin "Sayt → Ana səhifə"dən göstərib-gizlədir, mətnləri dəyişir
export async function HeroForm({ t }: TextsProps) {
  if (!(await getHomeContent()).heroFormEnabled) return null;
  return (
    <>
      <HeroQuickForm t={t} />
      <HeroNote t={t} />
    </>
  );
}
