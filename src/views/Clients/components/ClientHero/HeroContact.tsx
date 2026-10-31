import { MapPin, Phone, User } from "lucide-react";
import type { HeroContactProps } from "@/types/clients";

// Əlaqə: əlaqəli şəxs, telefon, (sabit məkanda) ünvan. Masaüstündə başlığın altında bir sətirdə, telefonda ayrı-ayrı yumşaq çiplərdə
export function HeroContact({ company, fixedPlace, mobile }: HeroContactProps) {
  const chip = mobile ? "flex min-w-0 items-center gap-2 rounded-lg bg-white/[0.07] px-2.5 py-1.5 text-[13px]" : "flex min-w-0 items-center gap-1.5";
  return (
    <div className={mobile ? "flex basis-full flex-wrap gap-1.5 sm:hidden" : "mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-white/75 max-sm:hidden"}>
      <span className={chip}><User size={14} className="shrink-0 text-white/50" /><span className="truncate">{company.contact_person ?? "Əlaqəli şəxs yoxdur"}</span></span>
      {company.phone
        ? <a href={`tel:${company.phone}`} aria-label={`Zəng et: ${company.phone}`} className={`${chip} font-semibold text-frost hover:underline ${mobile ? "flex-1 justify-center" : ""}`}><Phone size={14} className="shrink-0" />{mobile ? "Əlaqə" : company.phone}</a>
        : <span className={chip}><Phone size={14} className="shrink-0 text-white/50" />Telefon yoxdur</span>}
      {fixedPlace && (
        <span className={`${chip} ${mobile ? "basis-full" : ""}`}><MapPin size={14} className="shrink-0 text-white/50" /><span className={mobile ? "" : "truncate"}>{company.address ?? "Ünvan yazılmayıb"}</span></span>
      )}
    </div>
  );
}
